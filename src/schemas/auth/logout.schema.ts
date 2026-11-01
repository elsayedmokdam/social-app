import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { LanguageEnum, LogoutEnum } from "../../common";

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
