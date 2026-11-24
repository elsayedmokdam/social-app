"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const schemas_1 = require("../../schemas");
const post_service_1 = __importDefault(require("./post.service"));
const multer_1 = require("../../common/utils/multer");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFileUpload)({
        maxFileSize: 10,
    }).any(),
    validation: multer_1.fileValidations.image,
    customPath: "post",
    isRequired: false,
}), (0, middleware_1.validationMiddleware)(schemas_1.createPostSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const post = await post_service_1.default.createPost(req.user, {
        content: req.validated.body.content,
        files: req.validated.files,
    });
    return { status: 201, message: "Post created successfully", data: post };
}));
router.get("/", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.responseFormatter)(async (req) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await post_service_1.default.getUserPosts({
        limit,
        page,
        user: req.user,
    });
    return {
        data: result.data,
        extra: result.meta,
    };
}));
router.get("/:postId", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.postIdSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const post = await post_service_1.default.getPost(req.validated.params);
    return { data: post };
}));
router.patch("/:postId", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.updatePostSchema), (0, middleware_1.responseFormatter)(async (req) => {
    const post = await post_service_1.default.updatePost({
        ...req.validated?.params,
        user: req.user,
        update: req.validated?.body,
    });
    return {
        message: "Post updated successfully",
        data: post,
    };
}));
router.delete("/:postId", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.validationMiddleware)(schemas_1.postIdSchema), (0, middleware_1.responseFormatter)(async (req) => {
    await post_service_1.default.deletePost({
        ...req.validated?.params,
        user: req.user,
    });
    return { message: "Post deleted successfully" };
}));
exports.default = router;
