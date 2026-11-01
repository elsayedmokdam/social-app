import { z } from "zod";
import mongoose from "mongoose";
import { LanguageEnum } from "./enum";

const matchFields = ({
  data,
  field,
  match,
  ctx,
  lang,
}: {
  data: any;
  field: string;
  match: string;
  ctx: z.RefinementCtx;
  lang: LanguageEnum;
}) => {
  if (data[field] !== data[match]) {
    ctx.addIssue({
      code: "custom",
      path: [match],
      message:
        lang == LanguageEnum.AR
          ? "كلمة المرور غير متطابقة"
          : "Passwords do not match",
    });
  }
};

// const allowedExtentionsFiles = Object.values(fileValidations).flat();

export const generalValidationFields = {
  username: (lang: LanguageEnum) =>
    z
      .string()
      .min(3, {
        message:
          lang == LanguageEnum.AR
            ? "اسم المستخدم يجب ان يكون على الاقل 3 حروف"
            : "Username must be at least 3 characters.",
      })
      .max(20, {
        message:
          lang == LanguageEnum.AR
            ? "اسم المستخدم يجب ان لا يتجاوز 20 حرف"
            : "Username must not exceed 20 characters.",
      }),

  email: (lang: LanguageEnum) =>
    z.email({
      message:
        lang == LanguageEnum.AR
          ? "البريد الالكتروني غير صحيح"
          : "Only valid email is allowed.",
    }),

  password: (lang: LanguageEnum) =>
    z
      .string()
      .min(6, {
        message:
          lang == LanguageEnum.AR
            ? "كلمة المرور يجب ان تكون على الاقل 6 حروف"
            : "Password must be at least 6 characters.",
      })
      .max(20, {
        message:
          lang == LanguageEnum.AR
            ? "كلمة المرور يجب أن لا تتجاوز 20 حرف"
            : "Password must not exceed 20 characters.",
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/,
        {
          message:
            lang == LanguageEnum.AR
              ? "كلمة المرور يجب ان تحتوي على حرف كبير وحرف صغير ورقم وحرف خاص"
              : "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ),

  phone: (lang: LanguageEnum) =>
    z.string().regex(/^(\+2|002)?01[0125][0-9]{8}$/, {
      message:
        lang == LanguageEnum.AR
          ? "من فضلك ادخل رقم هاتف مصري صحيح"
          : "Only valid Egyptian phone number is allowed.",
    }),

  otp: (lang: LanguageEnum) =>
    z.string().regex(/^[0-9]{6}$/, {
      message:
        lang == LanguageEnum.AR
          ? "من فضلك ادخل رمز التحقق صحيح"
          : "Only valid OTP is allowed.",
    }),

  mongooId: (lang: LanguageEnum) =>
    z.string(lang == LanguageEnum.AR ? "id مطلوب" : "id is required").refine(
      (data) => {
        return mongoose.Types.ObjectId.isValid(data);
      },
      {
        message: lang == LanguageEnum.AR ? "id غير صالح" : "Invalid id format",
      },
    ),

  // file: (lang: LanguageEnum) =>
  //   z.strictObject({
  //     fieldname: z.string(),
  //     originalname: z.string(),
  //     encoding: z.string(),
  //     mimetype: z.enum(allowedExtentionsFiles, {
  //       message: lang === LanguageEnum.AR ? "ملف غير صالح" : "Invalid file",
  //     }),
  //     buffer: z.instanceof(Buffer),
  //     size: z.number(),
  //     path: z.string(),
  //   }),

  header: (lang: LanguageEnum) =>
    z.object({
      "accept-language": z
        .union([z.literal("0"), z.literal("1")], {
          message:
            lang === LanguageEnum.AR
              ? "accept-language يجب ان يكون 0|1"
              : "accept-language must be 0|1",
        })
        .default(lang === LanguageEnum.AR ? "1" : "0")
        .optional(),
    }),

  content: (lang: LanguageEnum) =>
    z
      .string()
      .min(3, {
        message:
          lang === LanguageEnum.AR
            ? "المحتوى يجب أن يكون 3 أحرف على الأقل"
            : "Content must be at least 3 characters",
      })
      .max(50000, {
        message:
          lang === LanguageEnum.AR
            ? "المحتوى يجب ألا يتجاوز 50000 حرف"
            : "Content must not exceed 50000 characters",
      })
      .optional(),

  matchFields,
};
