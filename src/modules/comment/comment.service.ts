import { CommentRepository, PostRepository } from "../../common/repository";
import { ForbiddenException, IComment, NotFoundException } from "../../common";
import { HComment, HUser } from "../../DB/models";
import { toObjectId } from "../../common/utils";

export class CommentService {
  private readonly commentRepository = new CommentRepository();
  private readonly postRepository = new PostRepository();

  async createComment(
    user: HUser,
    { postId, content }: { postId: string; content: string },
  ): Promise<HComment> {
    console.log({ postId, content });

    const post = await this.postRepository.findById({
      id: toObjectId(postId),
    });
    if (!post) throw new NotFoundException("Post not found");

    return await this.commentRepository.createOne({
      data: {
        postId: post._id,
        userId: user._id,
        content,
      },
    });
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 10) {
    const post = await this.postRepository.findById({
      id: toObjectId(postId),
    });
    if (!post) throw new NotFoundException("Post not found");

    return await this.commentRepository.find({
      filter: { postId: post._id },
      options: {
        page,
        limit,
        sort: { createdAt: 1 },
        populate: [{ path: "userId", select: "firstName lastName image" }],
      },
    });
  }

  async getComment(commentId: string) {
    const comment = await this.commentRepository.findById({
      id: toObjectId(commentId),
      options: {
        populate: [{ path: "userId", select: "firstName lastName image" }],
      },
    });
    if (!comment) throw new NotFoundException("Comment not found");
    return comment;
  }

  async updateComment(commentId: string, user: HUser, content: string) {
    const comment = await this.commentRepository.findById({
      id: toObjectId(commentId),
    });
    if (!comment) throw new NotFoundException("Comment not found");
    if (String(comment.userId) !== String(user._id)) {
      throw new ForbiddenException(
        "Only the comment owner can update this comment",
      );
    }
    return await this.commentRepository.findByIdAndUpdate({
      id: comment._id,
      update: { content },
    });
  }

  async deleteComment(commentId: string, user: HUser) {
    const comment = await this.commentRepository.findById({
      id: toObjectId(commentId),
    });
    if (!comment) throw new NotFoundException("Comment not found");

    const post = await this.postRepository.findById({
      id: comment.postId,
    });
    const isCommentOwner = String(comment.userId) === String(user._id);
    const isPostOwner = post ? String(post.userId) === String(user._id) : false;
    if (!isCommentOwner && !isPostOwner) {
      throw new ForbiddenException(
        "Only the comment owner or post owner can delete this comment",
      );
    }

    await this.commentRepository.findByIdAndDelete({ id: comment._id });
    return comment;
  }
}

export default new CommentService();
