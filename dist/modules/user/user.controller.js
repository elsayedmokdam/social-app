"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const common_1 = require("../../common");
const user_service_1 = __importDefault(require("./user.service"));
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/rotate-token", (0, middleware_1.authenticationMiddleware)(common_1.TokenTypeEnum.REFRESH), (0, middleware_1.responseFormatter)(async (req, res) => {
    const data = await user_service_1.default.rotateToken(req.payload, req.user, (0, common_1.issuer)(req));
    return data;
}));
exports.default = router;
