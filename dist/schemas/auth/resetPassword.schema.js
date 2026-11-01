"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = void 0;
const validation_1 = require("../../common/validation");
const resendConfirmEmail_schema_1 = require("./resendConfirmEmail.schema");
const resetPasswordSchema = (lang) => {
    const schema = (0, resendConfirmEmail_schema_1.resendConfirmEmailSchema)(lang);
    return schema
        .safeExtend({
        body: schema.shape.body.safeExtend({
            newPassword: validation_1.generalValidationFields.password(lang),
            confirmPassword: validation_1.generalValidationFields.password(lang),
        }),
        headers: validation_1.generalValidationFields.header(lang),
    })
        .superRefine((data, ctx) => {
        validation_1.generalValidationFields.matchFields({
            data: data.body,
            field: "newPassword",
            match: "confirmPassword",
            ctx,
            lang,
        });
    });
};
exports.resetPasswordSchema = resetPasswordSchema;
