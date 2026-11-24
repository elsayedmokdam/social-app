import mongoose from "mongoose";
import { IComment } from "../../common";

// This is the Initial Schema and Will Be Enhanced With Advanced Fields.
const commentSchema = new mongoose.Schema<IComment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: true,
  },
);

export const CommentModel =
  mongoose.models.comments ||
  mongoose.model<IComment>("comments", commentSchema);

export type HComment = mongoose.HydratedDocument<IComment>;
