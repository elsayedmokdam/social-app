"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.createCommentSchema = exports.commentIdSchema = exports.postCommentsSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../common/validation");
const postCommentsSchema = (lang) => zod_1.z.object({
    params: zod_1.z.object({
        postId: validation_1.generalValidationFields.mongooId(lang),
    }),
});
exports.postCommentsSchema = postCommentsSchema;
const commentIdSchema = (lang) => zod_1.z.object({
    params: zod_1.z.object({
        commentId: validation_1.generalValidationFields.mongooId(lang),
    }),
});
exports.commentIdSchema = commentIdSchema;
const createCommentSchema = (lang) => zod_1.z.object({
    params: zod_1.z.object({
        postId: validation_1.generalValidationFields.mongooId(lang),
    }),
    body: validation_1.generalValidationFields.content(lang),
});
exports.createCommentSchema = createCommentSchema;
const updateCommentSchema = (lang) => zod_1.z.object({
    params: zod_1.z.object({
        commentId: validation_1.generalValidationFields.mongooId(lang),
    }),
    body: validation_1.generalValidationFields.content(lang),
});
exports.updateCommentSchema = updateCommentSchema;
