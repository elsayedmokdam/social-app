import { HUser } from "../../DB/models";
import { ILoginResponse } from "../authentication/authentication.response";

export interface IRotateTokenResponse extends ILoginResponse {
  user: HUser;
}
