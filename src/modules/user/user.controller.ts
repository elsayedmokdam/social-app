import { Request, Response, Router } from "express";
import {
  authenticationMiddleware as authentication,
  responseFormatter,
  uploadMiddleware,
} from "../../middleware";
import { issuer, TokenTypeEnum } from "../../common";
import userService from "./user.service";
import { IRotateTokenResponse } from "./user.response";
import { fileValidations, localFileUpload } from "../../common/utils/multer";
import { IFile } from "../../common/types";
const router = Router({ strict: true, caseSensitive: true });

// Upload Profile Image
router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      maxFileSize: 5,
    }).single("attachment"),
    validation: fileValidations.image,
    customPath: "profile",
  }),
  responseFormatter(async (req: Request, res: Response) => {
    const data = await userService.uploadProfileImage({
      user: req.user!,
      file: req.file!,
    });
    return {
      message: "Profile Image Updated Successfully",
      data,
    };
  }),
);

// Upload Cover Images
router.patch(
  "/cover-images",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      maxFileSize: 5,
    }).array("attachments"),
    validation: fileValidations.image,
    customPath: "cover-images",
  }),
  responseFormatter(async (req: Request, res: Response) => {
    const data = await userService.uploadCoverImages({
      user: req.user!,
      files: req.files! as IFile[],
    });
    return {
      message: "Profile Image Updated Successfully",
      data,
    };
  }),
);


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
