import { z } from "zod";
import { confirmEmailSchema, loginSchema, resetPasswordSchema, signupSchema } from "../../schemas";

// Use z.infer to extract the type from the schema and define the SignUpDTO type
export type SignUpDTO = z.infer<ReturnType<typeof signupSchema>>;

export type LoginDTO = z.infer<ReturnType<typeof loginSchema>>;

export type ResetPasswordDTO = z.infer<ReturnType<typeof resetPasswordSchema>>;

export type ConfirmEmailDTO = z.infer<ReturnType<typeof confirmEmailSchema>>;

export type VerifyResetPasswordOTP = ConfirmEmailDTO;

export type Verify2FALogin = ConfirmEmailDTO;