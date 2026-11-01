"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    return res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        status: err?.status || 500,
        issues: err?.cause?.issues,
        err: err?.name,
        stack: err.stack
    });
};
exports.globalErrorHandler = globalErrorHandler;
