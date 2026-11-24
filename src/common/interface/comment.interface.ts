import mongoose from "mongoose";

export interface IComment {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
