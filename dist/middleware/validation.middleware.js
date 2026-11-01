"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const exception_1 = require("../common/exception");
const enum_1 = require("../common/enum");
const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const lang = req.headers["accept-language"]
            ? Number(req.headers["accept-language"])
            : enum_1.LanguageEnum.EN;
        const validationResult = schema(lang).safeParse({
            body: req.body,
            headers: req.headers,
            query: req.query,
            params: req.params,
        });
        if (!validationResult.success) {
            throw new exception_1.BadRequestException("Validation Error", {
                issues: validationResult.error.issues.map((issue) => ({
                    message: issue.message,
                    path: issue.path,
                })),
            });
        }
        else {
            req.validated = validationResult.data;
            next();
        }
    };
};
exports.validationMiddleware = validationMiddleware;
