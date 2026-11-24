import mongoose from "mongoose";

export interface IPost {
  userId: mongoose.Types.ObjectId;
  content: string;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
