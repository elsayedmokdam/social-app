import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { LanguageEnum } from "../../common";

export const resendConfirmEmailSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};
