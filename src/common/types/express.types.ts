import { HUser } from "../../DB/models";
import { JwtPayloadType } from "./jwt.types";

export type ValidatedRequestData = {
  body?: any;
  headers?: any;
  files?: any;
  query?: any;
  params?: any;
};

// Reopening module augmentation to add a new property to the Request interface
declare module "express-serve-static-core" {
  interface Request {
    validated?: ValidatedRequestData;
    user?:HUser;
    payload?: JwtPayloadType;
  }
}
