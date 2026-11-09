import { NextFunction, Request, RequestHandler, Response } from "express";
import { TokenTypeEnum, UnauthorizedException } from "../common";
import { tokenService } from "../common/service";
import { JwtPayloadType } from "../common/types";
import { HUser } from "../DB/models";

export const bearerAuth = async ({
  req,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  req: Request;
  tokenType: TokenTypeEnum;
}) => {
  const [key, credentials] = (req.headers["authorization"]?.split(" ") ||
    []) as [string, string];

  const { payload, user } = (await tokenService.decodeToken({
    authorization: credentials,
    tokenType,
  })) as { payload: JwtPayloadType; user: HUser };

  req.user = user;
  req.payload = payload;
};

export const authenticationMiddleware = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException("Unauthorized");
    }
    
    const [key, credentials] = authorization.split(" ") as [string, string];
    switch (key) {
      case "Bearer":
        await bearerAuth({ req, tokenType });
        break;
      case "Basic":
        const [email, password] = Buffer.from(credentials, "base64")
          .toString()
          .split(":") as [string, string];
        req.user = await tokenService.basicAuth({ email, password });
        break;
      default:
        next(
          new Error("Invalid Authentication Schema", {
            cause: { status: 400 },
          }),
        );
        break;
    }
    next();
  };
};
