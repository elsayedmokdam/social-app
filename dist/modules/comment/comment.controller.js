"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const schemas_1 = require("../../schemas");
const comment_service_1 = __importDefault(require("./comment.service"));
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/posts/:postId/comments", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.createCommentSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const comment = await comment_service_1.default.createComment(req.user, {
        ...req.validated?.body,
        ...req.validated?.params,
    });
    return {
        status: 201,
        message: "Comment created successfully",
        data: comment,
    };
}));
router.get("/posts/:postId/comments", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.postCommentsSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await comment_service_1.default.getPostComments(req.validated.params.postId, page, limit);
    return {
        message: "Comments retrieved successfully",
        data: result.data,
        extra: result.meta,
    };
}));
router.get("/comments/:commentId", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.commentIdSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const comment = await comment_service_1.default.getComment(req.validated.params.commentId);
    return { data: comment };
}));
router.patch("/comments/:commentId", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.updateCommentSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const comment = await comment_service_1.default.updateComment(req.validated.params.commentId, req.user, req.validated.body.content);
    return { message: "Comment updated successfully", data: comment };
}));
router.delete("/comments/:commentId", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.commentIdSchema), (0, middleware_1.responseFormatter)(async (req) => {
    await comment_service_1.default.deleteComment(req.validated.params.commentId, req.user);
    return { message: "Comment deleted successfully" };
}));
exports.default = router;
