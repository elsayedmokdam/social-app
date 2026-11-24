import { z } from "zod";
import { GenderEnum, LanguageEnum, LogoutEnum, RoleEnum } from "../common";
import { generalValidationFields } from "../common/validation";

export const loginBodySchema = (lang: LanguageEnum) => {
  return z.strictObject({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
  });
};

export const loginSchema = (lang: LanguageEnum) => {
  return z.object({
    body: loginBodySchema(lang),
    headers: generalValidationFields.header(lang),
  });
};

// Use safeExtend instead of extend if using refine or superRefine
export const signupSchema = (lang: LanguageEnum) => {
  return z.object({
    body: loginBodySchema(lang as LanguageEnum)
      .safeExtend({
        username: generalValidationFields.username(lang as LanguageEnum),
        confirmPassword: generalValidationFields.password(lang as LanguageEnum),
        phone: generalValidationFields.phone(lang as LanguageEnum),
        DOB: z.coerce.date().optional(),
        image: z.string().optional(),
        imageCover: z.array(z.string()).optional(),
        gender: z
          .enum(GenderEnum, {
            message:
              lang === LanguageEnum.AR
                ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                : "Invalid option: expected one of 0|1",
          })
          .optional(),
        role: z
          .enum(RoleEnum, {
            message:
              lang === LanguageEnum.AR
                ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                : "Invalid option: expected one of 0|1",
          })
          .optional(),
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({
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
            message:
              lang === LanguageEnum.AR
                ? "اسم المستخدم يجب ان يحتوي على مسافة واحدة على الأقل"
                : "Username must contain at least one space",
          });
        }
      }),
    headers: generalValidationFields.header(lang as LanguageEnum),
  });
};

export const confirmEmailSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};

export const forgotPasswordSchema = (lang: LanguageEnum) =>
  resendConfirmEmailSchema(lang as LanguageEnum);

export const resetPasswordSchema = (lang: LanguageEnum) => {
  const schema = resendConfirmEmailSchema(lang as LanguageEnum);
  return schema
    .safeExtend({
      body: schema.shape.body.safeExtend({
        newPassword: generalValidationFields.password(lang as LanguageEnum),
        confirmPassword: generalValidationFields.password(lang as LanguageEnum),
        otp: generalValidationFields.otp(lang as LanguageEnum),
      }),
      headers: generalValidationFields.header(lang as LanguageEnum),
    })
    .superRefine((data, ctx) => {
      generalValidationFields.matchFields({
        data: data.body,
        field: "newPassword",
        match: "confirmPassword",
        ctx,
        lang,
      });
    });
};

export const resendConfirmEmailSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};

export const verifyResetPasswordSchema = (lang: LanguageEnum) =>
  confirmEmailSchema(lang as LanguageEnum);

export const logoutSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      action: z
        .enum(LogoutEnum, {
          message:
            lang === LanguageEnum.AR
              ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
              : "Invalid option: expected one of 0|1",
        })
        .default(LogoutEnum.ONE),
    }),
    headers: generalValidationFields.header(lang),
  });
};
