import { Request, Response, Router } from "express";
import {
  authenticationMiddleware as authentication,
  responseFormatter,
} from "../../middleware";
import { issuer, TokenTypeEnum } from "../../common";
import userService from "./user.service";
import { IRotateTokenResponse } from "./user.response";
const router = Router({ strict: true, caseSensitive: true });

// Rotate Token
router.post(
  "/rotate-token",
  authentication(TokenTypeEnum.REFRESH),
  responseFormatter(
    async (req: Request, res: Response): Promise<IRotateTokenResponse> => {
      const data = await userService.rotateToken(
        req.payload!,
        req.user!,
        issuer(req),
      );
      return data;
    },
  ),
);

export default router;
