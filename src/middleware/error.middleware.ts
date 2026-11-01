import { NextFunction, Request, Response } from "express";
import { IError } from "../common";

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err?.status || 500,
    issues: err?.cause?.issues,
    err: err?.name,
    stack: err.stack
    // err: NODE_ENV === "development" ? err : undefined,
    // stack: NODE_ENV === "development" ? err.stack : undefined,
  });
};
