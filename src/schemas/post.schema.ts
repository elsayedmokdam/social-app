import { z } from "zod";
import { LanguageEnum } from "../common";
import { generalValidationFields } from "../common/validation";

export const postIdSchema = (lang: LanguageEnum) =>
  z.object({
    params: z.object({
      postId: generalValidationFields.mongooId(lang),
    }),
  });

export const createPostSchema = (lang: LanguageEnum) =>
  z.object({
    body: z.object({
      content: generalValidationFields.content(lang),
    }),
    files: z
      .array(generalValidationFields.file(lang))
      .max(3, {
        message:
          lang === LanguageEnum.AR
            ? "الحد الأقصى 3 ملفات"
            : "Maximum 3 files allowed",
      })
      .optional(),
  });

export const updatePostSchema = (lang: LanguageEnum) =>
  z.object({
    params: z.object({
      postId: generalValidationFields.mongooId(lang),
    }),
    body: z
      .object({
        content: generalValidationFields.content(lang).optional(),
        attachments: z.array(z.string()).optional(),
      })
      .refine(
        (body) => body.content !== undefined || body.attachments !== undefined,
        lang === LanguageEnum.AR
          ? "يجب تقديم محتوى أو مرفقات للتحديث"
          : "Provide content or attachments to update",
      ),
  });
