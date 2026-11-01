"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = void 0;
const resendConfirmEmail_schema_1 = require("./resendConfirmEmail.schema");
const forgotPasswordSchema = (lang) => (0, resendConfirmEmail_schema_1.resendConfirmEmailSchema)(lang);
exports.forgotPasswordSchema = forgotPasswordSchema;
