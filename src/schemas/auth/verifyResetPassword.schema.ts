import { LanguageEnum } from "../../common";
import { confirmEmailSchema } from "./confirmEmail.schema";

export const verifyResetPasswordSchema = (lang: LanguageEnum) =>
  confirmEmailSchema(lang as LanguageEnum);
