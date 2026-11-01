import { NextFunction, Router, type Request, type Response } from "express";
const router = Router({ strict: true, caseSensitive: true });
import authenticationService from "./authentication.service";
import { responseFormatter, validationMiddleware } from "../../middleware";
import { IResponse } from "../../common";
import { signupSchema } from "../../schemas";
import { SignUpDTO } from "./authentication.dto";

router.post(
  "/signup",
  validationMiddleware(signupSchema),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse> => {
      const data = await authenticationService.signup(
        req.validated!.body as SignUpDTO["body"],
      );
      return {
        status: 201,
        data,
        message: "User created successfully",
        extra: "Extra",
      };
    },
  ),
);

export default router;
