"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
const authentication_service_1 = __importDefault(require("./authentication.service"));
const middleware_1 = require("../../middleware");
const common_1 = require("../../common");
const schemas_1 = require("../../schemas");
router.post("/signup-with-gmail", (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const { data: { access_token, refresh_token }, message, status, } = await authentication_service_1.default.signupWithGmail(req.body, (0, common_1.issuer)(req));
    return {
        message,
        status,
        data: { access_token, refresh_token },
    };
}));
router.post("/signup", (0, middleware_1.validationMiddleware)(schemas_1.signupSchema), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await authentication_service_1.default.signup(req.validated.body);
    return {
        status: 201,
        data,
        message: "Signup Successful, Please Confirm Your Email to Continue",
    };
}));
router.post("/login", (0, middleware_1.validationMiddleware)(schemas_1.loginSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const { access_token, refresh_token } = await authentication_service_1.default.login(req.validated.body, (0, common_1.issuer)(req));
    return {
        message: "Login Successful",
        data: { access_token, refresh_token },
    };
}));
router.post("/2fa-login", (0, middleware_1.validationMiddleware)(schemas_1.loginSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    await authentication_service_1.default.twoFAlogin(req.validated.body, (0, common_1.issuer)(req));
    return {
        status: 201,
        message: "Two Step Verification Activated, OTP Sent Successfully",
    };
}));
router.post("/2fa/verify-otp", (0, middleware_1.validationMiddleware)(schemas_1.confirmEmailSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const { access_token, refresh_token } = await authentication_service_1.default.verify2FALogin({ ...req.validated.body }, (0, common_1.issuer)(req));
    return {
        message: "Login Successful",
        data: { access_token, refresh_token },
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
router.post("/forgot-password", (0, middleware_1.validationMiddleware)(schemas_1.resendConfirmEmailSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const message = await authentication_service_1.default.forgotPassword(req.validated.body);
    return { message };
}));
router.post("/reset-password", (0, middleware_1.validationMiddleware)(schemas_1.resendConfirmEmailSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const message = await authentication_service_1.default.resetPassword(req.validated.body);
    return { message };
}));
router.post("/logout", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.logoutSchema), (0, middleware_1.responseFormatter)(async (req, res) => {
    const message = await authentication_service_1.default.logout(req.payload, {
        ...req.validated.body,
    });
    return message;
}));
exports.default = router;
