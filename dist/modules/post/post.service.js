"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("../../common");
const repository_1 = require("../../common/repository");
const utils_1 = require("../../common/utils");
class PostService {
    postRepository = new repository_1.PostRepository();
    commentRepository = new repository_1.CommentRepository();
    async createPost(user, body) {
        return await this.postRepository.createOne({
            data: {
                userId: user._id,
                content: body.content,
                attachments: body.files?.map((file) => file.key) ?? [],
            },
        });
    }
    async getUserPosts({ user, page = 1, limit = 10, }) {
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
    async getPost({ postId }) {
        const post = await this.postRepository.findById({
            id: (0, utils_1.toObjectId)(postId),
            options: {
                populate: [{ path: "userId", select: "firstName lastName image" }],
            },
        });
        if (!post)
            throw new common_1.NotFoundException("Post not found");
        return post;
    }
    async updatePost({ postId, user, update, }) {
        console.log({ postId, user, update });
        const post = await this.postRepository.findById({
            id: (0, utils_1.toObjectId)(postId),
        });
        if (!post)
            throw new common_1.NotFoundException("Post not found");
        if (String(post.userId) !== String(user._id)) {
            throw new common_1.ForbiddenException("Only the post owner can update this post");
        }
        return await this.postRepository.findByIdAndUpdate({
            id: post._id,
            update,
        });
    }
    async deletePost({ postId, user, }) {
        const post = await this.postRepository.findById({
            id: (0, utils_1.toObjectId)(postId),
        });
        if (!post)
            throw new common_1.NotFoundException("Post not found");
        if (String(post.userId) !== String(user._id)) {
            throw new common_1.ForbiddenException("Only the post owner can delete this post");
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
exports.PostService = PostService;
exports.default = new PostService();
