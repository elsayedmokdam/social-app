import { config } from "dotenv";
import { resolve } from "node:path";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
config({ path: resolve(`.env.${NODE_ENV}`) });

// Application and Database Configurations
export const PORT: number = parseInt(process.env.PORT ?? "3000") as number;
export const APP_NAME: string = process.env.APP_NAME ?? "social_app" as string;
export const DB_URI: string = process.env.DB_URI ?? "mongodb://localhost:27017/" as string;
export const REDIS_URI: string = process.env.REDIS_URI as string;
export const ENC_KEY: string = process.env.ENC_KEY ?? "secret";
export const IV_LENGTH: number = parseInt(process.env.IV_LENGTH ?? "16") as number;

// Access Token Credentials
export const ACCESS_USER_TOKEN_SIGNATURE: string = process.env.ACCESS_USER_TOKEN_SIGNATURE as string;
export const ACCESS_ADMIN_TOKEN_SIGNATURE: string = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE as string;
export const ACCESS_TOKEN_EXPIRES_IN: number = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "3600") as number;

// Refresh Token Credentials
export const REFRESH_USER_TOKEN_SIGNATURE: string = process.env.REFRESH_USER_TOKEN_SIGNATURE as string;
export const REFRESH_ADMIN_TOKEN_SIGNATURE: string = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE as string;
export const REFRESH_TOKEN_EXPIRES_IN: number = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "31536000");

// Google Credentials
export const WEB_CLIENT_IDs: string[] = process.env.WEB_CLIENT_IDs?.split(",")??[""] as string[];

// Mail Credentials
export const APP_EMAIL: string = process.env.APP_EMAIL as string;
export const APP_PASSWORD: string = process.env.APP_PASSWORD as string;

// OTP
export const OTP_EXPIRES_IN: number = parseInt(process.env.OTP_EXPIRES_IN ?? "120");
export const OTP_MAX_TRIALS: number = parseInt(process.env.OTP_MAX_TRIALS ?? "3");
export const OTP_BLOCK_TIME: number = parseInt(process.env.OTP_BLOCK_TIME ?? "300");
export const TWO_FA_EXPIRESIN: number = parseInt(process.env.TWO_FA_EXPIRESIN ?? "120");

// Login Attemps
export const MAX_LOGIN_ATTEMPTS_TRIALS: number = parseInt(process.env.MAX_LOGIN_ATTEMPTS_TRIALS ?? "3");
export const LOGIN_ATTEMPT_BLOCK_TIME: number = parseInt(process.env.LOGIN_ATTEMPT_BLOCK_TIME ?? "300");

// Cors Options
export const CORS_ORIGINS: string[] = (process.env.CORS_ORIGINS?.split(",") ?? "http://localhost:3000") as string[];