import {
  ConfirmEmailDTO,
  LoginDTO,
  ResetPasswordDTO,
  SignUpDTO,
  Verify2FALogin,
  VerifyResetPasswordOTP,
} from "./authentication.dto";
import {
  BadRequestException,
  ConflictException,
  EmailSubjectEnum,
  IUser,
  LogoutEnum,
  maxLoginAttempsKeyFormat,
  NotFoundException,
  ProviderEnum,
  RoleEnum,
  TooManyRequsetException,
  UnauthorizedException,
  userBaseRevokeTokenKeyFormat,
  userCacheProfileKeyFormat,
} from "../../common";
import { HUser } from "../../DB/models";
import { UserRepository } from "../../common/repository";
import { CacheService, TokenService } from "../../common/service";
import {
  userCacheOTPKeyFormat,
  userCacheOTPTrialsKeyFormat,
} from "../../common/utils/otp/cache.otp";
import { compare, encryption, hash } from "../../common/security";
import {
  LOGIN_ATTEMPT_BLOCK_TIME,
  MAX_LOGIN_ATTEMPTS_TRIALS,
  OTP_BLOCK_TIME,
  OTP_EXPIRES_IN,
  OTP_MAX_TRIALS,
  TWO_FA_EXPIRESIN,
  WEB_CLIENT_IDs,
} from "../../config";
import { createOTP } from "../../common/utils/otp";
import { emailEvent } from "../../common/utils/email";
import {
  ILoginResponse,
  IResetPasswordResponse,
  SignupWithGmailResponse,
} from "./authentication.response";
import { OAuth2Client } from "google-auth-library";
import { JwtPayloadType } from "../../common/types";

export class AuthenticationService {
  private userRepository: UserRepository;
  private caheService: CacheService;
  private tokenService: TokenService;
  private client: OAuth2Client;

  constructor() {
    this.userRepository = new UserRepository();
    this.caheService = new CacheService();
    this.tokenService = new TokenService();
    this.client = new OAuth2Client();
  }

  // ----- Verify Google ID Token -----
  async verifyGoogleIDToken(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_IDs,
    });

    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException("Email not verified");
    }
    return payload;
  }

  // -------- SignUp With Gmail --------
  async signupWithGmail(
    { idToken }: { idToken: string },
    issuer: string,
  ): Promise<SignupWithGmailResponse> {
    const { name, email, picture } = (await this.verifyGoogleIDToken(
      idToken,
    )) as { name: string; email: string; picture: string };
    const existAccount = await this.userRepository.findOne({
      filter: { email },
    });

    if (existAccount) {
      // 1. Exist and Provider is not Google, then Conflict
      if (existAccount.provider !== ProviderEnum.GOOGLE) {
        throw new ConflictException("Invalid Account Provider");
      }
      // 2. Exist and Provider is Google, then Login
      return {
        status: 200,
        message: "Login Successful",
        data: await this.tokenService.createLoginCredentials({
          payload: {
            sub: existAccount._id,
            role: existAccount.role as RoleEnum,
          },
          options: { issuer },
        }),
      };
    }

    // 3. Not Exist, then Signup with Gmail
    const user = (await this.userRepository.createOne({
      data: {
        username: name,
        email,
        confirmEmail: Date.now(),
        image: picture,
        provider: ProviderEnum.GOOGLE,
        role: RoleEnum.USER,
      },
    })) as HUser;

    return {
      status: 201,
      message: "Signup Successful",
      data: await this.tokenService.createLoginCredentials({
        payload: {
          sub: user._id,
          role: user.role as RoleEnum,
        },
        options: { issuer },
      }),
    };
  }

  // -------------- SignUp -------------
  async signup({
    username,
    email,
    password,
    confirmPassword,
    phone,
    gender,
  }: SignUpDTO["body"]): Promise<IUser> {
    const existsUser: HUser = (await this.userRepository.findOne({
      filter: { email },
      projection: { email: 1 },
      options: { lean: true },
    })) as HUser;

    if (existsUser) {
      existsUser._id;
      throw new ConflictException("Email already exists.");
    }

    const user: HUser = await this.userRepository.create({
      data: {
        username,
        email,
        password: await hash(password),
        confirmPassword: await hash(confirmPassword),
        phone: await encryption(phone),
        gender,
      },
    });

    return user.toJSON();
  }

  // ----------- Login Helper -----------
  // ------- Prototype Overloading ------
  // For Login:
  async loginHelper(
    { email, password }: LoginDTO["body"],
    issuer: string,
    FA?: false,
  ): Promise<ILoginResponse>;

  // For 2FA Login:
  async loginHelper(
    { email, password }: LoginDTO["body"],
    issuer: string,
    FA: true,
  ): Promise<void>;

  // ------- Method Implementation ------
  async loginHelper(
    { email, password }: LoginDTO["body"],
    issuer: string,
    FA?: boolean,
  ): Promise<ILoginResponse | void> {
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        // confirmEmail: { $exists: true },
      },
    });
    const loginAttemps = await this.caheService.get({
      key: maxLoginAttempsKeyFormat({ email }),
    });

    if (
      (await this.caheService.ttl({
        key: maxLoginAttempsKeyFormat({ email }),
      })) > 0 &&
      loginAttemps >= MAX_LOGIN_ATTEMPTS_TRIALS
    ) {
      throw new NotFoundException(
        `Invalid Login Credentials, Please try again after ${LOGIN_ATTEMPT_BLOCK_TIME / 60 > 1 ? LOGIN_ATTEMPT_BLOCK_TIME / 60 : LOGIN_ATTEMPT_BLOCK_TIME} ${LOGIN_ATTEMPT_BLOCK_TIME / 60 > 1 ? "minutes" : "seconds"}`,
      );
    }

    if (!user) {
      // Login with Gmail and try to Login with System
      await this.caheService.set({
        key: maxLoginAttempsKeyFormat({ email }),
        value: 1 + loginAttemps,
      });
      if (loginAttemps >= MAX_LOGIN_ATTEMPTS_TRIALS) {
        await this.caheService.expire({
          key: maxLoginAttempsKeyFormat({ email }),
          ttl: LOGIN_ATTEMPT_BLOCK_TIME,
        });
      }
      throw new NotFoundException("Invalid Login Credentials");
    }

    // Login with System But Email Not Confirmed
    if (!user.confirmEmail)
      throw new NotFoundException("Please Confirm Email First to Login");

    // Check Password
    const match = await compare(password, user.password);
    if (!match) {
      await this.caheService.set({
        key: maxLoginAttempsKeyFormat({ email }),
        value: 1 + loginAttemps,
      });

      if (loginAttemps >= MAX_LOGIN_ATTEMPTS_TRIALS) {
        await this.caheService.expire({
          key: maxLoginAttempsKeyFormat({ email }),
          ttl: LOGIN_ATTEMPT_BLOCK_TIME,
        });
      }
      throw new NotFoundException("Invalid Login Credentials");
    }

    switch (FA) {
      case true:
        await this.sendEmailOTP({
          email: user.email,
          subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
          expiresIn: TWO_FA_EXPIRESIN,
        });
        await this.caheService.del({
          key: maxLoginAttempsKeyFormat({ email }),
        });
        break;
      default:
        await this.caheService.del({
          key: maxLoginAttempsKeyFormat({ email }),
        });
        return await this.tokenService.createLoginCredentials({
          payload: {
            sub: user._id,
            role: user.role as RoleEnum,
          },
          options: { issuer },
        });
    }
  }

  // -------------- Login --------------
  async login(
    { email, password }: LoginDTO["body"],
    issuer: string,
  ): Promise<ILoginResponse> {
    return await this.loginHelper({ email, password }, issuer);
  }

  // ------------ 2FA Login ------------
  async twoFAlogin(
    { email, password }: LoginDTO["body"],
    issuer: string,
  ): Promise<void> {
    return await this.loginHelper({ email, password }, issuer, true);
  }

  // ---------- Verify 2FA OTP ---------
  async verify2FALogin(
    { email, otp }: Verify2FALogin["body"],
    issuer: string,
  ): Promise<ILoginResponse> {
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
      },
    });

    // If User Not Found
    if (!user) throw new NotFoundException("Invalid Login Credentials");
    const cacheCode = await this.caheService.get({
      key: userCacheOTPKeyFormat({
        email,
        enumType: EmailSubjectEnum.TWO_STEP_VERIFICATION,
      }),
    });
    if (!cacheCode || !(await compare(otp, cacheCode)))
      throw new NotFoundException("Invalid OTP, Ask For Resend");

    return await this.tokenService.createLoginCredentials({
      payload: {
        sub: user._id,
        role: user.role as RoleEnum,
      },
      options: { issuer },
    });
  }

  // ---------- Send Email OTP ---------
  async sendEmailOTP({
    email,
    subject,
    expiresIn = OTP_EXPIRES_IN,
    maxTrials = OTP_MAX_TRIALS,
    blockTime = OTP_BLOCK_TIME,
  }: {
    email: string;
    subject: EmailSubjectEnum;
    expiresIn?: number;
    maxTrials?: number;
    blockTime?: number;
  }): Promise<void> {
    // Handle existing OTP
    const existOTP_TTL = await this.caheService.ttl({
      key: userCacheOTPKeyFormat({ email, enumType: subject }),
    });
    if (existOTP_TTL > 0)
      throw new ConflictException(
        "OTP Already Sent, Please check your email as we can't resend OTP after ${existOTP_TTL} seconds",
      );

    // Handle number of trials by checking it
    const oldTrials = await this.caheService.get({
      key: userCacheOTPTrialsKeyFormat({ email, enumType: subject }),
    });
    if (oldTrials >= maxTrials) {
      throw new TooManyRequsetException(
        `Maximum number of trials reached, Please try again after ${blockTime / 60 > 1 ? blockTime / 60 : blockTime} ${blockTime / 60 > 1 ? "minutes" : "seconds"}`,
      );
    }

    const data = {
      email,
      code: createOTP(),
    };
    await this.caheService.set({
      key: userCacheOTPKeyFormat({
        email,
        enumType: subject,
      }),
      value: await hash(data.code.toString()),
      ttl: expiresIn,
    });

    // Handle number of trials by incrementing it
    const currentTrials = await this.caheService.incrBy({
      key: userCacheOTPTrialsKeyFormat({ email, enumType: subject }),
    });
    // If the number of trials is greater than or equal to the maximum number of trials, expire the key by setting its TTL to the block time
    if (currentTrials >= maxTrials) {
      await this.caheService.expire({
        key: userCacheOTPTrialsKeyFormat({ email, enumType: subject }),
        ttl: blockTime,
      });
    }

    emailEvent.emit("sendEmail", {
      recipients: {
        to: email,
      },
      subject,
      data,
    });
  }

  // ----- Resend Confirm Email OTP ----
  async resendConfirmEmailOTP({ email }: { email: string }): Promise<string> {
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        // confirmEmail: { $exists: false },
      },
    });
    // If User Not Found
    if (!user) throw new NotFoundException("Invalid Login Credentials");

    // If User Email Already Confirmed
    if (user.confirmEmail)
      throw new NotFoundException("Email Already Confirmed");

    await this.sendEmailOTP({
      email: user.email,
      subject: EmailSubjectEnum.CONFIRM_EMAIL,
    });
    return "OTP Sent Successfully";
  }

  // ---------- Confirm Email ----------
  async confirmEmail({ email, otp }: ConfirmEmailDTO["body"]): Promise<void> {
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        // confirmEmail: { $exists: false },
      },
    });
    // If User Not Found
    if (!user) throw new NotFoundException("Invalid Login Credentials");

    // If User Email Already Confirmed
    if (user.confirmEmail)
      throw new NotFoundException("Email Already Confirmed");

    const cacheCode = await this.caheService.get({
      key: userCacheOTPKeyFormat({
        email: user.email,
        enumType: EmailSubjectEnum.CONFIRM_EMAIL,
      }),
    });
    if (!cacheCode || !(await compare(otp, cacheCode)))
      throw new NotFoundException("Invalid OTP, Ask for Resend");

    user.confirmEmail = Date.now() as unknown as string;
    await user.save();

    // Delete Cached OTP
    await this.caheService.del({
      key: await this.caheService.keys({
        prefix: userCacheOTPKeyFormat({
          email: user.email,
          enumType: EmailSubjectEnum.CONFIRM_EMAIL,
        }),
      }),
    });
  }

  // ---------- Forgot Password --------
  async forgotPassword({ email }: { email: string }): Promise<string> {
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        // confirmEmail: { $exists: true },
      },
    });
    // If User Not Found
    if (!user) throw new NotFoundException("Invalid Email");

    // If User Email Not Confirmed
    if (!user.confirmEmail)
      throw new NotFoundException("Please Confirm Email First");

    await this.sendEmailOTP({
      email: user.email,
      subject: EmailSubjectEnum.FORGOT_PASSWORD,
    });
    return "OTP Sent Successfully, Please check your email";
  }

  // ---------- Reset Password ---------
  async resetPassword({
    email,
    newPassword,
    confirmPassword,
    otp,
  }: ResetPasswordDTO["body"]): Promise<IResetPasswordResponse> {
    const { user } = await this.verifyResetPasswordOTP({ email, otp });
    user.password = await hash(newPassword);
    user.confirmPassword = await hash(confirmPassword);
    // To Logout User From All Devices
    user.changeCredentialsTime = new Date();
    await user.save();

    // Delete Cached OTP
    await this.caheService.del({
      key: await this.caheService.keys({
        prefix: userCacheOTPKeyFormat({
          email: user.email,
          enumType: EmailSubjectEnum.FORGOT_PASSWORD,
        }),
      }),
    });

    // Delete Cached Revoked Token Keys
    await this.caheService.del({
      key: await this.caheService.keys({
        prefix: userBaseRevokeTokenKeyFormat({
          userId: user._id,
        }),
      }),
    });

    // Delete Cached User Profile
    await this.caheService.del({
      key: userCacheProfileKeyFormat({
        userId: user._id,
      }),
    });
    return {
      user,
      message:
        "Password Reset Successfully, Please Login Again With New Password",
    };
  }

  // ----- Verify Reset Password OTP ---
  async verifyResetPasswordOTP({
    email,
    otp,
  }: VerifyResetPasswordOTP["body"]): Promise<IResetPasswordResponse> {
    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        // confirmEmail: { $exists: true },
      },
    });
    // If User Not Found
    if (!user) throw new NotFoundException("Invalid Email");

    // If User Email Not Confirmed
    if (!user.confirmEmail)
      throw new NotFoundException("Please Confirm Email First");

    const cacheCode = await this.caheService.get({
      key: userCacheOTPKeyFormat({
        email: user.email,
        enumType: EmailSubjectEnum.FORGOT_PASSWORD,
      }),
    });

    if (!cacheCode || !(await compare(otp, cacheCode)))
      throw new NotFoundException("Invalid OTP, Ask for Resend");
    return {
      user,
      message: "OTP Verified Successfully",
    };
  }

  // -------------- Logout -------------
  async logout(
    payload: JwtPayloadType,
    { action = LogoutEnum.ONE }: { action: LogoutEnum },
  ) {
    const userId = payload.sub;

    switch (action) {
      case LogoutEnum.ALL: {
        // Get Original User From DB because user Might Be Cached in Redis
        const currentUser = await this.userRepository.findById({
          id: userId,
        });

        if (!currentUser) {
          throw new UnauthorizedException(
            "Session Expired, Please Login Again",
          );
        }

        currentUser.changeCredentialsTime = new Date();
        await currentUser.save();

        // Delete All Revoked Token Keys
        const revokeTokenKeys = await this.caheService.keys({
          prefix: userBaseRevokeTokenKeyFormat({
            userId: currentUser._id,
          }),
        });

        if (revokeTokenKeys.length > 0) {
          await this.caheService.del({
            key: revokeTokenKeys,
          });
        }
        break;
      }
      default: {
        await this.tokenService.createRevokeToken({
          payload,
        });
        break;
      }
    }
    // Delete Profile From Cache
    await this.caheService.del({
      key: userCacheProfileKeyFormat({
        userId: payload.sub,
      }),
    });

    // Delete OTP From Cache
    await this.caheService.del({
      key: userCacheOTPKeyFormat({
        email: payload.email,
        enumType: EmailSubjectEnum.CONFIRM_EMAIL,
      }),
    });
    return {
      message: "Logout Successful",
    };
  }
}

// Apply Singleton Design Pattern.
export default new AuthenticationService();
