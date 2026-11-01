"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmailSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const confirmEmailSchema = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_1.generalValidationFields.email(lang),
            otp: validation_1.generalValidationFields.otp(lang),
        }),
        headers: validation_1.generalValidationFields.header(lang),
    });
};
exports.confirmEmailSchema = confirmEmailSchema;
