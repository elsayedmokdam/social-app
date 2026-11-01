import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { LanguageEnum } from "../../common";

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
