import { Router, Request, Response } from "express";
import {
  authenticationMiddleware as authentication,
  responseFormatter,
  uploadMiddleware,
  validationMiddleware as validation,
} from "../../middleware";
import {
  createPostSchema,
  postIdSchema,
  updatePostSchema,
} from "../../schemas";
import postService from "./post.service";
import { fileValidations, localFileUpload } from "../../common/utils/multer";

const router = Router({ strict: true, caseSensitive: true });

// Create Post
router.post(
  "/",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      maxFileSize: 10,
    }).any(),
    validation: fileValidations.image,
    customPath: "post",
    isRequired: false,
  }),
  validation(createPostSchema),
  responseFormatter(async (req: Request) => {
    const post = await postService.createPost(req.user!, {
      content: req.validated!.body.content,
      files: req.validated!.files,
    });
    return { status: 201, message: "Post created successfully", data: post };
  }),
);

// Get User Posts
router.get(
  "/",
  authentication(),
  responseFormatter(async (req: Request) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await postService.getUserPosts({
      limit,
      page,
      user: req.user!,
    });
    return {
      data: result.data,
      extra: result.meta,
    };
  }),
);

// Get Single Post
router.get(
  "/:postId",
  authentication(),
  validation(postIdSchema),

  responseFormatter(async (req: Request) => {
    const post = await postService.getPost(req.validated!.params);
    return { data: post };
  }),
);

// Update Post
router.patch(
  "/:postId",
  authentication(),
  validation(updatePostSchema),
  responseFormatter(async (req: Request) => {
    const post = await postService.updatePost({
      ...req.validated?.params,
      user: req.user!,
      update: req.validated?.body,
    });
    return {
      message: "Post updated successfully",
      data: post,
    };
  }),
);

// Delete Post
router.delete(
  "/:postId",
  authentication(),
  validation(postIdSchema),
  responseFormatter(async (req: Request) => {
    await postService.deletePost({
      ...req.validated?.params,
      user: req.user,
    });
    return { message: "Post deleted successfully" };
  }),
);

export default router;
