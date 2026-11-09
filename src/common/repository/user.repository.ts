import { CreateOptions, HydratedDocument } from "mongoose";
import { AnyKeys, Model } from "mongoose";
import { UserModel } from "../../DB/models";
import { DBRepository } from "./base.repository";
import { IUser } from "../interface";

export class UserRepository extends DBRepository<IUser> {
  constructor() {
    super(UserModel)
  }
}
