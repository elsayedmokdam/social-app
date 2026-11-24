import { PostModel } from "../../DB/models";
import { IPost } from "../interface";
import { DBRepository } from "./base.repository";

export class PostRepository extends DBRepository<IPost> {
  constructor() {
    super(PostModel);
  }
}
