"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const node_crypto_1 = require("node:crypto");
const config_1 = require("../../config");
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const repository_1 = require("../repository");
const utils_1 = require("../utils");
const cache_service_1 = require("./cache.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_1 = require("../security");
class TokenService {
    userRepository;
    cacheService;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.cacheService = new cache_service_1.CacheService();
    }
    async generateToken({ payload = {}, secret = config_1.ACCESS_USER_TOKEN_SIGNATURE, options = {}, }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token, secret, }) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new exception_1.UnauthorizedException("Session Expired, Please Login Again");
            }
            throw error;
        }
    }
    async getTokenSignatures({ TokenType = enum_1.TokenTypeEnum.ACCESS, role = enum_1.RoleEnum.USER, }) {
        let signatures = {};
        switch (role) {
            case enum_1.RoleEnum.ADMIN:
                signatures = {
                    [enum_1.TokenTypeEnum.ACCESS]: config_1.ACCESS_ADMIN_TOKEN_SIGNATURE,
                    [enum_1.TokenTypeEnum.REFRESH]: config_1.REFRESH_ADMIN_TOKEN_SIGNATURE,
                };
                break;
            default:
                signatures = {
                    [enum_1.TokenTypeEnum.ACCESS]: config_1.ACCESS_USER_TOKEN_SIGNATURE,
                    [enum_1.TokenTypeEnum.REFRESH]: config_1.REFRESH_USER_TOKEN_SIGNATURE,
                };
                break;
        }
        return signatures[TokenType];
    }
    async decodeToken({ authorization = "", tokenType = enum_1.TokenTypeEnum.ACCESS, }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        if (!decoded?.aud?.length) {
            throw new exception_1.BadRequestException("Missing Token Payload");
        }
        const payload = await this.verifyToken({
            token: authorization,
            secret: await this.getTokenSignatures({
                TokenType: tokenType,
                role: decoded.aud[0],
            }),
        });
        if (!payload?.sub) {
            throw new exception_1.BadRequestException("Missing Token Payload");
        }
        if (await this.cacheService.exists({
            key: (0, utils_1.userBaseRevokeTokenKeyFormat)({
                userId: payload.sub,
            }),
        })) {
            throw new exception_1.UnauthorizedException("Session Expired, Please Login Again");
        }
        const cachedUser = await this.cacheService.get({
            key: (0, utils_1.userCacheProfileKeyFormat)({ userId: payload.sub }),
        });
        const isTokenIssuedBeforeCredentialsChange = (changeCredentialsTime, issuedAt) => {
            const changedAt = changeCredentialsTime
                ? new Date(changeCredentialsTime).getTime()
                : 0;
            return changedAt > issuedAt * 1000;
        };
        if (isTokenIssuedBeforeCredentialsChange(cachedUser?.changeCredentialsTime, payload.iat)) {
            throw new exception_1.UnauthorizedException("Session Expired, Please Login Again");
        }
        if (cachedUser) {
            return { payload, user: cachedUser };
        }
        const user = await this.userRepository.findById({ id: payload.sub });
        if (!user) {
            throw new exception_1.UnauthorizedException("Session Expired, Please Login Again");
        }
        if (isTokenIssuedBeforeCredentialsChange(user?.changeCredentialsTime, payload.iat)) {
            throw new exception_1.UnauthorizedException("Session Expired, Please Login Again");
        }
        await this.cacheService.set({
            key: (0, utils_1.userCacheProfileKeyFormat)({ userId: payload.sub }),
            value: user,
            ttl: config_1.ACCESS_TOKEN_EXPIRES_IN,
        });
        return { payload, user };
    }
    async createLoginCredentials({ payload, options = {}, }) {
        const jwtId = (0, node_crypto_1.randomUUID)();
        const [accessSignature, refreshSignature] = await Promise.all([
            this.getTokenSignatures({
                TokenType: enum_1.TokenTypeEnum.ACCESS,
                role: payload.role,
            }),
            this.getTokenSignatures({
                TokenType: enum_1.TokenTypeEnum.REFRESH,
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
                    audience: [payload.role],
                    expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN,
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
                    audience: [payload.role],
                    expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN,
                },
                secret: refreshSignature,
            }),
        ]);
        return {
            access_token,
            refresh_token,
        };
    }
    async createRevokeToken({ payload, }) {
        const consumedTime = Date.now() / 1000 - payload.iat;
        const refreshExpiresIn = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
        const ttl = refreshExpiresIn - consumedTime;
        await this.cacheService.set({
            key: (0, utils_1.userRevokeTokenKeyFormat)({
                userId: payload.sub,
                jti: payload.jti,
            }),
            value: payload.jti,
            ttl,
        });
        return;
    }
    async basicAuth({ email, password, }) {
        const user = await this.userRepository.findOne({
            filter: { email },
        });
        if (user) {
            const match = await (0, security_1.compare)(password, user.password);
            if (match) {
                return user;
            }
        }
        throw new exception_1.NotFoundException("Invalid Login Credentials");
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
