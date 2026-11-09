import { NextFunction, Router, type Request, type Response } from "express";
const router = Router({ strict: true, caseSensitive: true });
import authenticationService from "./authentication.service";
import {
  authenticationMiddleware as authentication,
  responseFormatter,
  validationMiddleware as validation,
} from "../../middleware";
import { IResponse, issuer, IUser } from "../../common";
import {
  confirmEmailSchema,
  loginSchema,
  logoutSchema,
  resendConfirmEmailSchema,
  signupSchema,
} from "../../schemas";
import { SignUpDTO } from "./authentication.dto";
import { ILoginResponse } from "./authentication.response";

// Signup With Gmail
router.post(
  "/signup-with-gmail",
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<ILoginResponse>> => {
      const {
        data: { access_token, refresh_token },
        message,
        status,
      } = await authenticationService.signupWithGmail(req.body, issuer(req));
      return {
        message,
        status,
        data: { access_token, refresh_token },
      };
    },
  ),
);

// Signup
router.post(
  "/signup",
  validation(signupSchema),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<IUser>> => {
      const data = await authenticationService.signup(
        req.validated!.body as SignUpDTO["body"],
      );
      return {
        status: 201,
        data,
        message: "Signup Successful, Please Confirm Your Email to Continue",
      };
    },
  ),
);

// Login
router.post(
  "/login",
  validation(loginSchema),
  responseFormatter(
    async (req: Request, res: Response): Promise<IResponse<ILoginResponse>> => {
      const { access_token, refresh_token } = await authenticationService.login(
        req.validated!.body,
        issuer(req),
      );
      return {
        message: "Login Successful",
        data: { access_token, refresh_token },
      };
    },
  ),
);

// 2FA Login
router.post(
  "/2fa-login",
  validation(loginSchema),
  responseFormatter(async (req: Request, res: Response) => {
    await authenticationService.twoFAlogin(req.validated!.body, issuer(req));
    return {
      status: 201,
      message: "Two Step Verification Activated, OTP Sent Successfully",
    };
  }),
);

// Verify 2FA Login
router.post(
  "/2fa/verify-otp",
  validation(confirmEmailSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const { access_token, refresh_token } =
      await authenticationService.verify2FALogin(
        { ...req.validated!.body },
        issuer(req),
      );
    return {
      message: "Login Successful",
      data: { access_token, refresh_token },
    };
  }),
);

// Resend Confirm Email OTP
router.post(
  "/resend-confirm-email-otp",
  validation(resendConfirmEmailSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const message = await authenticationService.resendConfirmEmailOTP(
      req.validated!.body,
    );
    return { message };
  }),
);

// Confirm Email
router.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const data = await authenticationService.confirmEmail(req.validated!.body);
    return {
      data,
      message: "Email Confirmed Successfully, Login to Continue",
    };
  }),
);

// Forgot Password
router.post(
  "/forgot-password",
  validation(resendConfirmEmailSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const message = await authenticationService.forgotPassword(
      req.validated!.body,
    );
    return { message };
  }),
);

// Reset Password
router.post(
  "/reset-password",
  validation(resendConfirmEmailSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const message = await authenticationService.resetPassword(
      req.validated!.body,
    );
    return { message };
  }),
);

// Logout
router.post(
  "/logout",
  authentication(),
  validation(logoutSchema),
  responseFormatter(async (req: Request, res: Response) => {
    const message = await authenticationService.logout(req.payload!, {
      ...req.validated!.body,
    });
    return message;
  }),
);

export default router;
