import { z } from "zod";
import { LanguageEnum } from "../common";
import { generalValidationFields } from "../common/validation";

export const postCommentsSchema = (lang: LanguageEnum) =>
  z.object({
    params: z.object({
      postId: generalValidationFields.mongooId(lang),
    }),
  });

export const commentIdSchema = (lang: LanguageEnum) =>
  z.object({
    params: z.object({
      commentId: generalValidationFields.mongooId(lang),
    }),
  });

export const createCommentSchema = (lang: LanguageEnum) =>
  z.object({
    params: z.object({
      postId: generalValidationFields.mongooId(lang),
    }),
    body: generalValidationFields.content(lang),
  });

export const updateCommentSchema = (lang: LanguageEnum) =>
  z.object({
    params: z.object({
      commentId: generalValidationFields.mongooId(lang),
    }),
    body: generalValidationFields.content(lang),
  });
