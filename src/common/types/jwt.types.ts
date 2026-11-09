import { JwtPayload } from "jsonwebtoken";
import { MongoDBId } from ".";
import { RoleEnum } from "../enum";

export type JwtPayloadType = Omit<JwtPayload, "sub" | "aud"> & {
  sub: MongoDBId;
  aud: number[];
  jti: string;
  role: RoleEnum;
};
