import { randomUUID } from "node:crypto";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config";
import { RoleEnum, TokenTypeEnum } from "../enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../exception";
import { UserRepository } from "../repository";
import { JwtPayloadType } from "../types";
import {
  userBaseRevokeTokenKeyFormat,
  userCacheProfileKeyFormat,
  userRevokeTokenKeyFormat,
} from "../utils";
import { cacheService, CacheService } from "./cache.service";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { HUser } from "../../DB/models";
import { compare } from "../security";

export class TokenService {
  private readonly userRepository: UserRepository;
  private readonly cacheService: CacheService;

  constructor() {
    this.userRepository = new UserRepository();
    this.cacheService =cacheService;
  }

  async generateToken({
    payload = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE,
    options = {},
  }: {
    payload: string | Buffer | object;
    secret: Secret;
    options?: SignOptions;
  }): Promise<string> {
    return jwt.sign(payload, secret, options);
  }

  async verifyToken({
    token,
    secret,
  }: {
    token: string;
    secret: string;
  }): Promise<JwtPayloadType> {
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Session Expired, Please Login Again");
      }
      throw error;
    }
  }

  async getTokenSignatures({
    TokenType = TokenTypeEnum.ACCESS,
    role = RoleEnum.USER,
  }: {
    TokenType: TokenTypeEnum;
    role: RoleEnum;
  }): Promise<string> {
    let signatures = {};
    switch (role) {
      case RoleEnum.ADMIN:
        signatures = {
          [TokenTypeEnum.ACCESS]: ACCESS_ADMIN_TOKEN_SIGNATURE,
          [TokenTypeEnum.REFRESH]: REFRESH_ADMIN_TOKEN_SIGNATURE,
        };
        break;
      default:
        signatures = {
          [TokenTypeEnum.ACCESS]: ACCESS_USER_TOKEN_SIGNATURE,
          [TokenTypeEnum.REFRESH]: REFRESH_USER_TOKEN_SIGNATURE,
        };
        break;
    }
    return signatures[TokenType as keyof typeof signatures];
  }

  async decodeToken({
    authorization = "",
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    authorization: string;
    tokenType: TokenTypeEnum;
  }): Promise<{
    payload: JwtPayloadType;
    user: HUser;
  }> {
    const decoded = jwt.decode(authorization) as JwtPayloadType;
    if (!decoded?.aud?.length) {
      throw new BadRequestException("Missing Token Payload");
    }

    const payload = await this.verifyToken({
      token: authorization,
      secret: await this.getTokenSignatures({
        TokenType: tokenType,
        role: decoded.aud[0]!,
      }),
    });

    if (!payload?.sub) {
      throw new BadRequestException("Missing Token Payload");
    }

    // Check if the token is revoked
    if (
      await this.cacheService.exists({
        key: userBaseRevokeTokenKeyFormat({
          userId: payload.sub,
        }),
      })
    ) {
      throw new UnauthorizedException("Session Expired, Please Login Again");
    }

    // Check if the user is cached
    const cachedUser = await this.cacheService.get({
      key: userCacheProfileKeyFormat({ userId: payload.sub }),
    });

    const isTokenIssuedBeforeCredentialsChange = (
      changeCredentialsTime: string | undefined | Date,
      issuedAt: number,
    ) => {
      const changedAt = changeCredentialsTime
        ? new Date(changeCredentialsTime).getTime()
        : 0;

      return changedAt > issuedAt * 1000;
    };

    //  Check If Cached User Logged Out From All Devices
    if (
      isTokenIssuedBeforeCredentialsChange(
        cachedUser?.changeCredentialsTime,
        payload.iat,
      )
    ) {
      throw new UnauthorizedException("Session Expired, Please Login Again");
    }

    if (cachedUser) {
      return { payload, user: cachedUser };
    }

    // If not cached, then Get User From DB
    const user = await this.userRepository.findById({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException("Session Expired, Please Login Again");
    }

    // Logout from all devices, then the user.changeCredentialsTime will be updated to the current time, and the payload.iat will be less than the user.changeCredentialsTime, so the token will be invalid.
    if (
      isTokenIssuedBeforeCredentialsChange(
        user?.changeCredentialsTime,
        payload.iat,
      )
    ) {
      throw new UnauthorizedException("Session Expired, Please Login Again");
    }

    // Cache the user
    await this.cacheService.set({
      key: userCacheProfileKeyFormat({ userId: payload.sub }),
      value: user,
      ttl: ACCESS_TOKEN_EXPIRES_IN,
    });

    return { payload, user };
  }

  async createLoginCredentials({
    payload,
    options = {},
  }: {
    payload: Pick<JwtPayloadType, "sub" | "role">;
    options?: SignOptions;
  }): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const jwtId = randomUUID();
    const [accessSignature, refreshSignature] = await Promise.all([
      this.getTokenSignatures({
        TokenType: TokenTypeEnum.ACCESS,
        role: payload.role,
      }),

      this.getTokenSignatures({
        TokenType: TokenTypeEnum.REFRESH,
        role: payload.role,
      }),
    ]);
    const [access_token, refresh_token] = await Promise.all([
      this.generateToken({
        payload: {
          sub: payload.sub,
          role: payload.role,
          jti: jwtId,
        },
        options: {
          ...options,
          audience: [payload.role as unknown as string],
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        },
        secret: accessSignature,
      }),

      this.generateToken({
        payload: {
          sub: payload.sub,
          role: payload.role,
          jti: jwtId,
        },
        options: {
          ...options,
          audience: [payload.role as unknown as string],
          expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        },
        secret: refreshSignature,
      }),
    ]);
    return {
      access_token,
      refresh_token,
    };
  }

  async createRevokeToken({
    payload,
  }: {
    payload: JwtPayloadType;
  }): Promise<void> {
    // payload.iat => iat of the access token, and it is equal to iat of the refresh token, because both tokens are generated at the same time
    const consumedTime = Date.now() / 1000 - payload.iat;
    const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN;
    const ttl = refreshExpiresIn - consumedTime;

    await this.cacheService.set({
      key: userRevokeTokenKeyFormat({
        userId: payload.sub,
        jti: payload.jti,
      }),
      value: payload.jti,
      ttl,
    });
    return;
  }

  async basicAuth({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<HUser> {
    const user = await this.userRepository.findOne({
      filter: { email },
    });

    if (user) {
      const match = await compare(password, user.password);
      if (match) {
        return user;
      }
    }
    throw new NotFoundException("Invalid Login Credentials");
  }
}

export const tokenService = new TokenService();
