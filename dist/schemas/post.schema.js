"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = exports.postIdSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../common");
const validation_1 = require("../common/validation");
const postIdSchema = (lang) => zod_1.z.object({
    params: zod_1.z.object({
        postId: validation_1.generalValidationFields.mongooId(lang),
    }),
});
exports.postIdSchema = postIdSchema;
const createPostSchema = (lang) => zod_1.z.object({
    body: zod_1.z.object({
        content: validation_1.generalValidationFields.content(lang),
    }),
    files: zod_1.z
        .array(validation_1.generalValidationFields.file(lang))
        .max(3, {
        message: lang === common_1.LanguageEnum.AR
            ? "الحد الأقصى 3 ملفات"
            : "Maximum 3 files allowed",
    })
        .optional(),
});
exports.createPostSchema = createPostSchema;
const updatePostSchema = (lang) => zod_1.z.object({
    params: zod_1.z.object({
        postId: validation_1.generalValidationFields.mongooId(lang),
    }),
    body: zod_1.z
        .object({
        content: validation_1.generalValidationFields.content(lang).optional(),
        attachments: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .refine((body) => body.content !== undefined || body.attachments !== undefined, lang === common_1.LanguageEnum.AR
        ? "يجب تقديم محتوى أو مرفقات للتحديث"
        : "Provide content or attachments to update"),
});
exports.updatePostSchema = updatePostSchema;
