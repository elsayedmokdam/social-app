"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const common_1 = require("../../common");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const cache_otp_1 = require("../../common/utils/otp/cache.otp");
const security_1 = require("../../common/security");
const config_1 = require("../../config");
const otp_1 = require("../../common/utils/otp");
const email_1 = require("../../common/utils/email");
const google_auth_library_1 = require("google-auth-library");
class AuthenticationService {
    userRepository;
    caheService;
    tokenService;
    client;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.caheService = new service_1.CacheService();
        this.tokenService = new service_1.TokenService();
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleIDToken(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: config_1.WEB_CLIENT_IDs,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new common_1.BadRequestException("Email not verified");
        }
        return payload;
    }
    async signupWithGmail({ idToken }, issuer) {
        const { name, email, picture } = (await this.verifyGoogleIDToken(idToken));
        const existAccount = await this.userRepository.findOne({
            filter: { email },
        });
        if (existAccount) {
            if (existAccount.provider !== common_1.ProviderEnum.GOOGLE) {
                throw new common_1.ConflictException("Invalid Account Provider");
            }
            return {
                status: 200,
                message: "Login Successful",
                data: await this.tokenService.createLoginCredentials({
                    payload: {
                        sub: existAccount._id,
                        role: existAccount.role,
                    },
                    options: { issuer },
                }),
            };
        }
        const user = (await this.userRepository.createOne({
            data: {
                username: name,
                email,
                confirmEmail: Date.now(),
                image: picture,
                provider: common_1.ProviderEnum.GOOGLE,
                role: common_1.RoleEnum.USER,
            },
        }));
        return {
            status: 201,
            message: "Signup Successful",
            data: await this.tokenService.createLoginCredentials({
                payload: {
                    sub: user._id,
                    role: user.role,
                },
                options: { issuer },
            }),
        };
    }
    async signup(inputs) {
        const checkDuplicate = await this.userRepository.findOne({
            filter: { email: inputs.email },
        });
        if (checkDuplicate)
            throw new common_1.ConflictException("Email Already Exists");
        const user = await this.userRepository.createOne({
            data: {
                ...inputs,
                password: await (0, security_1.hash)(inputs.password),
                confirmPassword: await (0, security_1.hash)(inputs.confirmPassword),
                phone: await (0, security_1.encryption)(inputs.phone),
            },
            options: { validateBeforeSave: true },
        });
        await this.sendEmailOTP({
            email: inputs.email,
            subject: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
        });
        return user;
    }
    async loginHelper({ email, password }, issuer, FA) {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        const loginAttemps = await this.caheService.get({
            key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
        });
        if ((await this.caheService.ttl({
            key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
        })) > 0 &&
            loginAttemps >= config_1.MAX_LOGIN_ATTEMPTS_TRIALS) {
            throw new common_1.NotFoundException(`Invalid Login Credentials, Please try again after ${config_1.LOGIN_ATTEMPT_BLOCK_TIME / 60 > 1 ? config_1.LOGIN_ATTEMPT_BLOCK_TIME / 60 : config_1.LOGIN_ATTEMPT_BLOCK_TIME} ${config_1.LOGIN_ATTEMPT_BLOCK_TIME / 60 > 1 ? "minutes" : "seconds"}`);
        }
        if (!user) {
            await this.caheService.set({
                key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
                value: 1 + loginAttemps,
            });
            if (loginAttemps >= config_1.MAX_LOGIN_ATTEMPTS_TRIALS) {
                await this.caheService.expire({
                    key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
                    ttl: config_1.LOGIN_ATTEMPT_BLOCK_TIME,
                });
            }
            throw new common_1.NotFoundException("Invalid Login Credentials");
        }
        if (!user.confirmEmail)
            throw new common_1.NotFoundException("Please Confirm Email First to Continue");
        const match = await (0, security_1.compare)(password, user.password);
        if (!match) {
            await this.caheService.set({
                key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
                value: 1 + loginAttemps,
            });
            if (loginAttemps >= config_1.MAX_LOGIN_ATTEMPTS_TRIALS) {
                await this.caheService.expire({
                    key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
                    ttl: config_1.LOGIN_ATTEMPT_BLOCK_TIME,
                });
            }
            throw new common_1.NotFoundException("Invalid Login Credentials");
        }
        switch (FA) {
            case true:
                await this.sendEmailOTP({
                    email: user.email,
                    subject: common_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
                    expiresIn: config_1.TWO_FA_EXPIRESIN,
                });
                await this.caheService.del({
                    key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
                });
                break;
            default:
                await this.caheService.del({
                    key: (0, common_1.maxLoginAttempsKeyFormat)({ email }),
                });
                return await this.tokenService.createLoginCredentials({
                    payload: {
                        sub: user._id,
                        role: user.role,
                    },
                    options: { issuer },
                });
        }
    }
    async login({ email, password }, issuer) {
        return await this.loginHelper({ email, password }, issuer);
    }
    async twoFAlogin({ email, password }, issuer) {
        return await this.loginHelper({ email, password }, issuer, true);
    }
    async verify2FALogin({ email, otp }, issuer) {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Login Credentials");
        const cacheCode = await this.caheService.get({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email,
                enumType: common_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
            }),
        });
        if (!cacheCode || !(await (0, security_1.compare)(otp, cacheCode)))
            throw new common_1.NotFoundException("Invalid OTP, Ask For Resend");
        return await this.tokenService.createLoginCredentials({
            payload: {
                sub: user._id,
                role: user.role,
            },
            options: { issuer },
        });
    }
    async sendEmailOTP({ email, subject, expiresIn = config_1.OTP_EXPIRES_IN, maxTrials = config_1.OTP_MAX_TRIALS, blockTime = config_1.OTP_BLOCK_TIME, }) {
        const existOTP_TTL = await this.caheService.ttl({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({ email, enumType: subject }),
        });
        if (existOTP_TTL > 0)
            throw new common_1.ConflictException(`OTP Already Sent, Please check your email as we can't resend OTP after ${existOTP_TTL} seconds`);
        const oldTrials = await this.caheService.get({
            key: (0, cache_otp_1.userCacheOTPTrialsKeyFormat)({ email, enumType: subject }),
        });
        if (oldTrials >= maxTrials) {
            throw new common_1.TooManyRequsetException(`Maximum number of trials reached, Please try again after ${blockTime / 60 > 1 ? blockTime / 60 : blockTime} ${blockTime / 60 > 1 ? "minutes" : "seconds"}`);
        }
        const data = {
            email,
            code: (0, otp_1.createOTP)(),
        };
        await this.caheService.set({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email,
                enumType: subject,
            }),
            value: await (0, security_1.hash)(data.code.toString()),
            ttl: expiresIn,
        });
        const currentTrials = await this.caheService.incrBy({
            key: (0, cache_otp_1.userCacheOTPTrialsKeyFormat)({ email, enumType: subject }),
        });
        if (currentTrials >= maxTrials) {
            await this.caheService.expire({
                key: (0, cache_otp_1.userCacheOTPTrialsKeyFormat)({ email, enumType: subject }),
                ttl: blockTime,
            });
        }
        email_1.emailEvent.emit("sendEmail", {
            recipients: {
                to: email,
            },
            subject,
            data,
        });
    }
    async resendConfirmEmailOTP({ email }) {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Login Credentials");
        if (user.confirmEmail)
            throw new common_1.NotFoundException("Email Already Confirmed");
        await this.sendEmailOTP({
            email: user.email,
            subject: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
        });
        return "OTP Sent Successfully";
    }
    async confirmEmail({ email, otp }) {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Login Credentials");
        if (user.confirmEmail)
            throw new common_1.NotFoundException("Email Already Confirmed");
        const cacheCode = await this.caheService.get({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email: user.email,
                enumType: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
            }),
        });
        if (!cacheCode || !(await (0, security_1.compare)(otp, cacheCode)))
            throw new common_1.NotFoundException("Invalid OTP, Ask for Resend");
        user.confirmEmail = Date.now();
        await user.save();
        await this.caheService.del({
            key: await this.caheService.keys({
                prefix: (0, cache_otp_1.userCacheOTPKeyFormat)({
                    email: user.email,
                    enumType: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
                }),
            }),
        });
    }
    async forgotPassword({ email }) {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Email");
        if (!user.confirmEmail)
            throw new common_1.NotFoundException("Please Confirm Email First");
        await this.sendEmailOTP({
            email: user.email,
            subject: common_1.EmailSubjectEnum.FORGOT_PASSWORD,
        });
        return "OTP Sent Successfully, Please check your email";
    }
    async resetPassword({ email, newPassword, confirmPassword, otp, }) {
        const { user } = await this.verifyResetPasswordOTP({ email, otp });
        user.password = await (0, security_1.hash)(newPassword);
        user.confirmPassword = await (0, security_1.hash)(confirmPassword);
        user.changeCredentialsTime = new Date();
        await user.save();
        await this.caheService.del({
            key: await this.caheService.keys({
                prefix: (0, cache_otp_1.userCacheOTPKeyFormat)({
                    email: user.email,
                    enumType: common_1.EmailSubjectEnum.FORGOT_PASSWORD,
                }),
            }),
        });
        await this.caheService.del({
            key: await this.caheService.keys({
                prefix: (0, common_1.userBaseRevokeTokenKeyFormat)({
                    userId: user._id,
                }),
            }),
        });
        await this.caheService.del({
            key: (0, common_1.userCacheProfileKeyFormat)({
                userId: user._id,
            }),
        });
        return {
            user,
            message: "Password Reset Successfully, Please Login Again With New Password",
        };
    }
    async verifyResetPasswordOTP({ email, otp, }) {
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: common_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user)
            throw new common_1.NotFoundException("Invalid Email");
        if (!user.confirmEmail)
            throw new common_1.NotFoundException("Please Confirm Email First");
        const cacheCode = await this.caheService.get({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email: user.email,
                enumType: common_1.EmailSubjectEnum.FORGOT_PASSWORD,
            }),
        });
        if (!cacheCode || !(await (0, security_1.compare)(otp, cacheCode)))
            throw new common_1.NotFoundException("Invalid OTP, Ask for Resend");
        return {
            user,
            message: "OTP Verified Successfully",
        };
    }
    async logout(payload, { action = common_1.LogoutEnum.ONE }) {
        const userId = payload.sub;
        switch (action) {
            case common_1.LogoutEnum.ALL: {
                const currentUser = await this.userRepository.findById({
                    id: userId,
                });
                if (!currentUser) {
                    throw new common_1.UnauthorizedException("Session Expired, Please Login Again");
                }
                currentUser.changeCredentialsTime = new Date();
                await currentUser.save();
                const revokeTokenKeys = await this.caheService.keys({
                    prefix: (0, common_1.userBaseRevokeTokenKeyFormat)({
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
        await this.caheService.del({
            key: (0, common_1.userCacheProfileKeyFormat)({
                userId: payload.sub,
            }),
        });
        await this.caheService.del({
            key: (0, cache_otp_1.userCacheOTPKeyFormat)({
                email: payload.email,
                enumType: common_1.EmailSubjectEnum.CONFIRM_EMAIL,
            }),
        });
        return {
            message: "Logout Successful",
        };
    }
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
