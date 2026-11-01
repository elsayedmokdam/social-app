import { LanguageEnum } from "../../common";
import { resendConfirmEmailSchema } from "./resendConfirmEmail.schema";

export const forgotPasswordSchema = (lang: LanguageEnum) =>
  resendConfirmEmailSchema(lang as LanguageEnum);
