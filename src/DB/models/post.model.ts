import mongoose from "mongoose";
import { IPost } from "../../common";

const postSchema = new mongoose.Schema<IPost>(
  {
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
      maxlength: [50000, "Content must not exceed 50000 characters"],
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: true,
  },
);

export const PostModel =
  mongoose.models.posts || mongoose.model<IPost>("posts", postSchema);

export type HPost = mongoose.HydratedDocument<IPost>;
