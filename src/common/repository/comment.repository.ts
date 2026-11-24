import { CommentModel } from "../../DB/models";
import { IComment } from "../interface";
import { DBRepository } from "./base.repository";

export class CommentRepository extends DBRepository<IComment> {
  constructor() {
    super(CommentModel);
  }
}
