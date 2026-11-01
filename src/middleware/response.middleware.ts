import { NextFunction, Request, Response } from "express";
import { IResponse } from "../common";

export const responseFormatter = (handler: Function) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const {
      data = undefined,
      message = "Success",
      extra= undefined,
      status = 200,
    }: IResponse = (await handler(req, res, next)) || {};
    return res.headersSent
      ? undefined
      : res.status(status).json({ message, status, data, extra });
  };
};
