"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("../../common");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const config_1 = require("../../config");
class UserService {
    tokenService;
    userRepository;
    cloudService;
    constructor() {
        this.tokenService = service_1.tokenService;
        this.userRepository = new repository_1.UserRepository();
        this.cloudService = service_1.cloudService;
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
    async uploadProfileImage({ user, file, }) {
        return await this.userRepository.findByIdAndUpdate({
            id: user._id,
            update: { image: file.key },
            options: { projection: { password: 0, confirmPassword: 0 } },
        });
    }
    async uploadCoverImages({ user, files, }) {
        return await this.userRepository.findByIdAndUpdate({
            id: user._id,
            update: { imageCover: files.map((file) => file.key) },
            options: { projection: { password: 0, confirmPassword: 0 } },
        });
    }
}
exports.UserService = UserService;
exports.default = new UserService();
