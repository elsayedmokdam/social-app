import {
  FindResult,
  ForbiddenException,
  IPost,
  NotFoundException,
} from "../../common";
import { CommentRepository, PostRepository } from "../../common/repository";
import { HPost, HUser } from "../../DB/models";
import { toObjectId } from "../../common/utils";
import { IFile } from "../../common/types";

export class PostService {
  private readonly postRepository = new PostRepository();
  private readonly commentRepository = new CommentRepository();

  // --------- Create Post ----------
  async createPost(
    user: HUser,
    body: {
      content: string;
      files?: IFile[];
    },
  ): Promise<HPost> {
    return await this.postRepository.createOne({
      data: {
        userId: user._id,
        content: body.content,
        attachments: body.files?.map((file) => file.key) ?? [],
      },
    });
  }

  // -------- Get User Posts ---------
  async getUserPosts({
    user,
    page = 1,
    limit = 10,
  }: {
    user: HUser;
    page: number;
    limit: number;
  }): Promise<FindResult<HPost>> {
    return await this.postRepository.find({
      filter: { userId: user._id },
      options: {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
          {
            path: "userId",
            select: "firstName lastName image",
          },
        ],
      },
    });
  }

  // -------- Get Single Post ---------
  async getPost({ postId }: { postId: string }) {
    const post = await this.postRepository.findById({
      id: toObjectId(postId),
      options: {
        populate: [{ path: "userId", select: "firstName lastName image" }],
      },
    });
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }

  // ---------- Update Post -----------
  async updatePost({
    postId,
    user,
    update,
  }: {
    postId: string;
    user: HUser;
    update: Partial<IPost>;
  }): Promise<HPost | null> {
    console.log({ postId, user, update});
    
    const post = await this.postRepository.findById({
      id: toObjectId(postId),
    });
    if (!post) throw new NotFoundException("Post not found");
    if (String(post.userId) !== String(user._id)) {
      throw new ForbiddenException("Only the post owner can update this post");
    }
    return await this.postRepository.findByIdAndUpdate({
      id: post._id,
      update,
    });
  }

  // ---------- Delete Post -----------
  async deletePost({
    postId,
    user,
  }: {
    postId: string;
    user: HUser;
  }): Promise<HPost> {
    const post = await this.postRepository.findById({
      id: toObjectId(postId),
    });
    if (!post) throw new NotFoundException("Post not found");
    if (String(post.userId) !== String(user._id)) {
      throw new ForbiddenException("Only the post owner can delete this post");
    }
    await this.commentRepository.deleteMany({
      filter: { postId: post._id },
    });
    await this.postRepository.findByIdAndDelete({
      id: post._id,
    });
    return post;
  }
}

export default new PostService();
