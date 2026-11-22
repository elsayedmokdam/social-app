"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const common_1 = require("../../common");
const user_service_1 = __importDefault(require("./user.service"));
const multer_1 = require("../../common/utils/multer");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.patch("/profile-image", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFileUpload)({
        maxFileSize: 5,
    }).single("attachment"),
    validation: multer_1.fileValidations.image,
    customPath: "profile",
}), (0, middleware_1.responseFormatter)(async (req, res) => {
    const data = await user_service_1.default.uploadProfileImage({
        user: req.user,
        file: req.file,
    });
    return {
        message: "Profile Image Updated Successfully",
        data,
    };
}));
router.patch("/cover-images", (0, middleware_1.authenticationMiddleware)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFileUpload)({
        maxFileSize: 5,
    }).array("attachments"),
    validation: multer_1.fileValidations.image,
    customPath: "cover-images",
}), (0, middleware_1.responseFormatter)(async (req, res) => {
    const data = await user_service_1.default.uploadCoverImages({
        user: req.user,
        files: req.files,
    });
    return {
        message: "Profile Image Updated Successfully",
        data,
    };
}));
router.post("/rotate-token", (0, middleware_1.authenticationMiddleware)(common_1.TokenTypeEnum.REFRESH), (0, middleware_1.responseFormatter)(async (req, res) => {
    const data = await user_service_1.default.rotateToken(req.payload, req.user, (0, common_1.issuer)(req));
    return data;
}));
exports.default = router;
