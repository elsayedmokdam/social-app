"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "posts",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, "Content must not be empty"],
        maxlength: [5000, "Content must not exceed 5000 characters"],
    },
}, {
    timestamps: true,
    strict: true,
    autoIndex: true,
});
exports.CommentModel = mongoose_1.default.models.comments ||
    mongoose_1.default.model("comments", commentSchema);
