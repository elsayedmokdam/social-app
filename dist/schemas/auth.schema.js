"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.verifyResetPasswordSchema = exports.resendConfirmEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.confirmEmailSchema = exports.signupSchema = exports.loginSchema = exports.loginBodySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../common");
const validation_1 = require("../common/validation");
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
const signupSchema = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginBodySchema)(lang)
            .safeExtend({
            username: validation_1.generalValidationFields.username(lang),
            confirmPassword: validation_1.generalValidationFields.password(lang),
            phone: validation_1.generalValidationFields.phone(lang),
            DOB: zod_1.z.coerce.date().optional(),
            image: zod_1.z.string().optional(),
            imageCover: zod_1.z.array(zod_1.z.string()).optional(),
            gender: zod_1.z
                .enum(common_1.GenderEnum, {
                message: lang === common_1.LanguageEnum.AR
                    ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                    : "Invalid option: expected one of 0|1",
            })
                .optional(),
            role: zod_1.z
                .enum(common_1.RoleEnum, {
                message: lang === common_1.LanguageEnum.AR
                    ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                    : "Invalid option: expected one of 0|1",
            })
                .optional(),
        })
            .superRefine((data, ctx) => {
            validation_1.generalValidationFields.matchFields({
                data,
                field: "password",
                match: "confirmPassword",
                ctx,
                lang,
            });
            if (!data.username.includes(" ")) {
                ctx.addIssue({
                    code: "custom",
                    path: ["username"],
                    message: lang === common_1.LanguageEnum.AR
                        ? "اسم المستخدم يجب ان يحتوي على مسافة واحدة على الأقل"
                        : "Username must contain at least one space",
                });
            }
        }),
        headers: validation_1.generalValidationFields.header(lang),
    });
};
exports.signupSchema = signupSchema;
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
const forgotPasswordSchema = (lang) => (0, exports.resendConfirmEmailSchema)(lang);
exports.forgotPasswordSchema = forgotPasswordSchema;
const resetPasswordSchema = (lang) => {
    const schema = (0, exports.resendConfirmEmailSchema)(lang);
    return schema
        .safeExtend({
        body: schema.shape.body.safeExtend({
            newPassword: validation_1.generalValidationFields.password(lang),
            confirmPassword: validation_1.generalValidationFields.password(lang),
            otp: validation_1.generalValidationFields.otp(lang),
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
const resendConfirmEmailSchema = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_1.generalValidationFields.email(lang),
        }),
        headers: validation_1.generalValidationFields.header(lang),
    });
};
exports.resendConfirmEmailSchema = resendConfirmEmailSchema;
const verifyResetPasswordSchema = (lang) => (0, exports.confirmEmailSchema)(lang);
exports.verifyResetPasswordSchema = verifyResetPasswordSchema;
const logoutSchema = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            action: zod_1.z
                .enum(common_1.LogoutEnum, {
                message: lang === common_1.LanguageEnum.AR
                    ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                    : "Invalid option: expected one of 0|1",
            })
                .default(common_1.LogoutEnum.ONE),
        }),
        headers: validation_1.generalValidationFields.header(lang),
    });
};
exports.logoutSchema = logoutSchema;
