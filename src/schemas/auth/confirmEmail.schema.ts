import { z } from "zod";
import { LanguageEnum } from "../../common";
import { generalValidationFields } from "../../common/validation";

export const confirmEmailSchema = (lang: LanguageEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};
