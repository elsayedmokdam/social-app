import { LanguageEnum } from "../../common";
import { generalValidationFields } from "../../common/validation";
import { resendConfirmEmailSchema } from "./resendConfirmEmail.schema";

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
