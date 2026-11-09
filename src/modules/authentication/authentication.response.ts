import { HUser } from "../../DB/models";

export interface ILoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface IResetPasswordResponse {
    message: string;
    user: HUser;
}

export interface SignupWithGmailResponse {
    status: number;
    message: string;
    data: ILoginResponse;
}