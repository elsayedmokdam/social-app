"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("./enum");
const matchFields = ({ data, field, match, ctx, lang, }) => {
    if (data[field] !== data[match]) {
        ctx.addIssue({
            code: "custom",
            path: [match],
            message: lang == enum_1.LanguageEnum.AR
                ? "كلمة المرور غير متطابقة"
                : "Passwords do not match",
        });
    }
};
exports.generalValidationFields = {
    username: (lang) => zod_1.z
        .string()
        .min(3, {
        message: lang == enum_1.LanguageEnum.AR
            ? "اسم المستخدم يجب ان يكون على الاقل 3 حروف"
            : "Username must be at least 3 characters.",
    })
        .max(20, {
        message: lang == enum_1.LanguageEnum.AR
            ? "اسم المستخدم يجب ان لا يتجاوز 20 حرف"
            : "Username must not exceed 20 characters.",
    }),
    email: (lang) => zod_1.z.email({
        message: lang == enum_1.LanguageEnum.AR
            ? "البريد الالكتروني غير صحيح"
            : "Only valid email is allowed.",
    }),
    password: (lang) => zod_1.z
        .string()
        .min(6, {
        message: lang == enum_1.LanguageEnum.AR
            ? "كلمة المرور يجب ان تكون على الاقل 6 حروف"
            : "Password must be at least 6 characters.",
    })
        .max(20, {
        message: lang == enum_1.LanguageEnum.AR
            ? "كلمة المرور يجب أن لا تتجاوز 20 حرف"
            : "Password must not exceed 20 characters.",
    })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/, {
        message: lang == enum_1.LanguageEnum.AR
            ? "كلمة المرور يجب ان تحتوي على حرف كبير وحرف صغير ورقم وحرف خاص"
            : "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
    phone: (lang) => zod_1.z.string().regex(/^(\+2|002)?01[0125][0-9]{8}$/, {
        message: lang == enum_1.LanguageEnum.AR
            ? "من فضلك ادخل رقم هاتف مصري صحيح"
            : "Only valid Egyptian phone number is allowed.",
    }),
    otp: (lang) => zod_1.z.string().regex(/^[0-9]{6}$/, {
        message: lang == enum_1.LanguageEnum.AR
            ? "من فضلك ادخل رمز التحقق صحيح"
            : "Only valid OTP is allowed.",
    }),
    mongooId: (lang) => zod_1.z.string(lang == enum_1.LanguageEnum.AR ? "id مطلوب" : "id is required").refine((data) => {
        return mongoose_1.default.Types.ObjectId.isValid(data);
    }, {
        message: lang == enum_1.LanguageEnum.AR ? "id غير صالح" : "Invalid id format",
    }),
    header: (lang) => zod_1.z.object({
        "accept-language": zod_1.z
            .union([zod_1.z.literal("0"), zod_1.z.literal("1")], {
            message: lang === enum_1.LanguageEnum.AR
                ? "accept-language يجب ان يكون 0|1"
                : "accept-language must be 0|1",
        })
            .default(lang === enum_1.LanguageEnum.AR ? "1" : "0")
            .optional(),
    }),
    content: (lang) => zod_1.z
        .string()
        .min(3, {
        message: lang === enum_1.LanguageEnum.AR
            ? "المحتوى يجب أن يكون 3 أحرف على الأقل"
            : "Content must be at least 3 characters",
    })
        .max(50000, {
        message: lang === enum_1.LanguageEnum.AR
            ? "المحتوى يجب ألا يتجاوز 50000 حرف"
            : "Content must not exceed 50000 characters",
    })
        .optional(),
    matchFields,
};
