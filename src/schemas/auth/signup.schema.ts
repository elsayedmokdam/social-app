import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { GenderEnum, LanguageEnum, RoleEnum } from "../../common";
import { loginBodySchema } from "./login.schema";
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
