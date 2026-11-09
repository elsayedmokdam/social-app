"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("../../common");
const service_1 = require("../../common/service");
const config_1 = require("../../config");
class UserService {
    tokenService;
    constructor() {
        this.tokenService = new service_1.TokenService();
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const remainingTime = accessExpiresIn - Date.now();
        const tenMinutes = 10 * 60 * 1000;
        if (remainingTime > tenMinutes) {
            throw new common_1.ConflictException("Access token is still valid");
        }
        const { access_token, refresh_token } = await this.tokenService.createLoginCredentials({
            payload: user,
            options: {
                issuer,
            },
        });
        await this.tokenService.createRevokeToken({ payload });
        return {
            access_token,
            refresh_token,
            user,
        };
    }
}
exports.UserService = UserService;
exports.default = new UserService();
