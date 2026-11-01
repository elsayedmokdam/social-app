"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetPasswordSchema = void 0;
const confirmEmail_schema_1 = require("./confirmEmail.schema");
const verifyResetPasswordSchema = (lang) => (0, confirmEmail_schema_1.confirmEmailSchema)(lang);
exports.verifyResetPasswordSchema = verifyResetPasswordSchema;
