"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
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
        maxlength: [50000, "Content must not exceed 50000 characters"],
    },
    attachments: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
    strict: true,
    autoIndex: true,
});
exports.PostModel = mongoose_1.default.models.posts || mongoose_1.default.model("posts", postSchema);
