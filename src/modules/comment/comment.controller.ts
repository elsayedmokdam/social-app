import { Router, Request } from "express";
import {
  authenticationMiddleware as authentication,
  responseFormatter,
  validationMiddleware as validation,
} from "../../middleware";
import {
  commentIdSchema,
  createCommentSchema,
  postCommentsSchema,
  updateCommentSchema,
} from "../../schemas";
import commentService from "./comment.service";

const router = Router({ strict: true, caseSensitive: true });

// Create Comment
router.post(
  "/posts/:postId/comments",
  authentication(),
  validation(createCommentSchema),
  responseFormatter(async (req: Request) => {
    const comment = await commentService.createComment(req.user!, {
      ...req.validated?.body,
      ...req.validated?.params,
    });
    return {
      status: 201,
      message: "Comment created successfully",
      data: comment,
    };
  }),
);

// Get Post Comments
router.get(
  "/posts/:postId/comments",
  authentication(),
  validation(postCommentsSchema),
  responseFormatter(async (req: Request) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await commentService.getPostComments(
      req.validated!.params.postId,
      page,
      limit,
    );
    return {
      message: "Comments retrieved successfully",
      data: result.data,
      extra: result.meta,
    };
  }),
);

// Get Single Comment
router.get(
  "/comments/:commentId",
  authentication(),
  validation(commentIdSchema),
  responseFormatter(async (req: Request) => {
    const comment = await commentService.getComment(
      req.validated!.params.commentId,
    );
    return { data: comment };
  }),
);

// Update Comment
router.patch(
  "/comments/:commentId",
  authentication(),
  validation(updateCommentSchema),
  responseFormatter(async (req: Request) => {
    const comment = await commentService.updateComment(
      req.validated!.params.commentId,
      req.user!,
      req.validated!.body.content,
    );
    return { message: "Comment updated successfully", data: comment };
  }),
);

// Delete Comment
router.delete(
  "/comments/:commentId",
  authentication(),
  validation(commentIdSchema),
  responseFormatter(async (req: Request) => {
    await commentService.deleteComment(
      req.validated!.params.commentId,
      req.user!,
    );
    return { message: "Comment deleted successfully" };
  }),
);


export default router;
