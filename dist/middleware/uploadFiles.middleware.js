"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = require("../common/utils/multer");
const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation, }) => {
    return (req, res, next) => {
        try {
            multerMiddleware(req, res, async (err) => {
                if (err) {
                    next(new Error(err.message, { cause: { status: 400 } }));
                    return;
                }
                try {
                    if (isRequired &&
                        !req.file &&
                        !(Array.isArray(req.files) && req.files.length) &&
                        !(typeof req.files == "object" && Object.keys(req.files)?.length)) {
                        throw new Error("File is required", { cause: { status: 400 } });
                    }
                    await (0, multer_1.processMulterUpload)({
                        customPath,
                        validation,
                        req,
                    });
                    next();
                }
                catch (error) {
                    next(error);
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.uploadMiddleware = uploadMiddleware;
