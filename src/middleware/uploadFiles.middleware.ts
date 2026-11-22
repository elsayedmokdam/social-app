import { NextFunction, Request, RequestHandler, Response } from "express";
import { processMulterUpload } from "../common/utils/multer";

export const uploadMiddleware = ({
  isRequired = true,
  multerMiddleware,
  customPath = "general",
  validation,
} :{
  isRequired?: boolean;
  multerMiddleware: RequestHandler;
  customPath?: string;
  validation: string[]
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      multerMiddleware(req, res, async (err) => {
        if (err) {
          next(new Error(err.message, { cause: { status: 400 } }));
          return;
        }
        try {
          if (
            isRequired &&
            !req.file &&
            !(Array.isArray(req.files) && req.files.length) &&
            !(typeof req.files == "object" && Object.keys(req.files)?.length)
          ) {
            throw new Error("File is required", { cause: { status: 400 } });
          }
          await processMulterUpload({
            customPath,
            validation,
            req,
          });
          next();
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  };
};
