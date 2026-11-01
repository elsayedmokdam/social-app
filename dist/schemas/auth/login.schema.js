"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.loginBodySchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const loginBodySchema = (lang) => {
    return zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email(lang),
        password: validation_1.generalValidationFields.password(lang),
    });
};
exports.loginBodySchema = loginBodySchema;
const loginSchema = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginBodySchema)(lang),
        headers: validation_1.generalValidationFields.header(lang),
    });
};
exports.loginSchema = loginSchema;
