import { BadRequestException } from "../common/exception";
import { LanguageEnum } from "../common/enum";
import { NextFunction, Request, Response } from "express";
import { ValidatedRequestData, ValidationSchemaType } from "../common/types";

export const validationMiddleware = (schema: ValidationSchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const lang = req.headers["accept-language"]
      ? Number(req.headers["accept-language"])
      : LanguageEnum.EN;

    const validationResult = schema(lang).safeParse({
      body: req.body,
      headers: req.headers,
      // files: req.files,
      query: req.query,
      params: req.params,
    });

    if (!validationResult.success) {
      throw new BadRequestException("Validation Error", {
        issues: validationResult.error.issues.map((issue: any) => ({
          message: issue.message,
          path: issue.path,
        })),
      });
    } else {
      req.validated = validationResult.data as ValidatedRequestData;
      next();
    }
  };
};
