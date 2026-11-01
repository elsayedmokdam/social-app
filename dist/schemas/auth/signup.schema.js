"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const common_1 = require("../../common");
const login_schema_1 = require("./login.schema");
const signupSchema = (lang) => {
    return zod_1.z.object({
        body: (0, login_schema_1.loginBodySchema)(lang)
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
