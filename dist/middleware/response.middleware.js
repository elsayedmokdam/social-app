"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseFormatter = void 0;
const responseFormatter = (handler) => {
    return async (req, res, next) => {
        const { data = undefined, message = "Success", extra = undefined, status = 200, } = (await handler(req, res, next)) || {};
        return res.headersSent
            ? undefined
            : res.status(status).json({ message, status, data, extra });
    };
};
exports.responseFormatter = responseFormatter;
