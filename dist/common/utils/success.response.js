"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ res, data = undefined, message = "Success", extra = undefined, status = 200, }) => {
    return res.status(status).json({ message, status, data, extra });
};
exports.successResponse = successResponse;
