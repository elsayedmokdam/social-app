"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
const authentication_service_1 = __importDefault(require("./authentication.service"));
const middleware_1 = require("../../middleware");
const schemas_1 = require("../../schemas");
router.post("/signup", (0, middleware_1.validationMiddleware)(schemas_1.signupSchema), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.signup(req.validated.body);
    return {
        status: 201,
        data,
        message: "User created successfully",
    };
}));
router.post("/resend-confirm-email-otp", (0, middleware_1.validationMiddleware)(schemas_1.resendConfirmEmailSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const message = await authentication_service_1.default.resendConfirmEmailOTP(req.validated.body);
    return { message };
}));
router.patch("/confirm-email", (0, middleware_1.validationMiddleware)(schemas_1.confirmEmailSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const data = await authentication_service_1.default.confirmEmail(req.validated.body);
    return {
        data,
        message: "Email Confirmed Successfully, Login to Continue",
    };
}));
exports.default = router;
