"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationException = void 0;
class ApplicationException extends Error {
    status;
    constructor(message, cause, status) {
        super(message, { cause });
        this.status = status;
    }
}
exports.ApplicationException = ApplicationException;
