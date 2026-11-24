"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const repository_1 = require("../../common/repository");
const common_1 = require("../../common");
const utils_1 = require("../../common/utils");
class CommentService {
    commentRepository = new repository_1.CommentRepository();
    postRepository = new repository_1.PostRepository();
    async createComment(user, { postId, content }) {
        console.log({ postId, content });
        const post = await this.postRepository.findById({
            id: (0, utils_1.toObjectId)(postId),
        });
        if (!post)
            throw new common_1.NotFoundException("Post not found");
        return await this.commentRepository.createOne({
            data: {
                postId: post._id,
                userId: user._id,
                content,
            },
        });
    }
    async getPostComments(postId, page = 1, limit = 10) {
        const post = await this.postRepository.findById({
            id: (0, utils_1.toObjectId)(postId),
        });
        if (!post)
            throw new common_1.NotFoundException("Post not found");
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
    async getComment(commentId) {
        const comment = await this.commentRepository.findById({
            id: (0, utils_1.toObjectId)(commentId),
            options: {
                populate: [{ path: "userId", select: "firstName lastName image" }],
            },
        });
        if (!comment)
            throw new common_1.NotFoundException("Comment not found");
        return comment;
    }
    async updateComment(commentId, user, content) {
        const comment = await this.commentRepository.findById({
            id: (0, utils_1.toObjectId)(commentId),
        });
        if (!comment)
            throw new common_1.NotFoundException("Comment not found");
        if (String(comment.userId) !== String(user._id)) {
            throw new common_1.ForbiddenException("Only the comment owner can update this comment");
        }
        return await this.commentRepository.findByIdAndUpdate({
            id: comment._id,
            update: { content },
        });
    }
    async deleteComment(commentId, user) {
        const comment = await this.commentRepository.findById({
            id: (0, utils_1.toObjectId)(commentId),
        });
        if (!comment)
            throw new common_1.NotFoundException("Comment not found");
        const post = await this.postRepository.findById({
            id: comment.postId,
        });
        const isCommentOwner = String(comment.userId) === String(user._id);
        const isPostOwner = post ? String(post.userId) === String(user._id) : false;
        if (!isCommentOwner && !isPostOwner) {
            throw new common_1.ForbiddenException("Only the comment owner or post owner can delete this comment");
        }
        await this.commentRepository.findByIdAndDelete({ id: comment._id });
        return comment;
    }
}
exports.CommentService = CommentService;
exports.default = new CommentService();
