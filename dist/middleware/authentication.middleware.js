"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationMiddleware = exports.bearerAuth = void 0;
const common_1 = require("../common");
const service_1 = require("../common/service");
const bearerAuth = async ({ req, tokenType = common_1.TokenTypeEnum.ACCESS, }) => {
    const [key, credentials] = (req.headers["authorization"]?.split(" ") ||
        []);
    const { payload, user } = (await service_1.tokenService.decodeToken({
        authorization: credentials,
        tokenType,
    }));
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const authenticationMiddleware = (tokenType = common_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new common_1.UnauthorizedException("Unauthorized");
        }
        const [key, credentials] = authorization.split(" ");
        switch (key) {
            case "Bearer":
                await (0, exports.bearerAuth)({ req, tokenType });
                break;
            case "Basic":
                const [email, password] = Buffer.from(credentials, "base64")
                    .toString()
                    .split(":");
                req.user = await service_1.tokenService.basicAuth({ email, password });
                break;
            default:
                next(new Error("Invalid Authentication Schema", {
                    cause: { status: 400 },
                }));
                break;
        }
        next();
    };
};
exports.authenticationMiddleware = authenticationMiddleware;
