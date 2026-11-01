"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequsetException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.NotFoundException = exports.ConflictException = void 0;
const error_exception_1 = require("./error.exception");
class ConflictException extends error_exception_1.ApplicationException {
    constructor(message = "Conflict", cause = {}) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class NotFoundException extends error_exception_1.ApplicationException {
    constructor(message = "Not Found", cause = {}) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends error_exception_1.ApplicationException {
    constructor(message = "Bad Request", cause = {}) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends error_exception_1.ApplicationException {
    constructor(message = "Unauthorized", cause = {}) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends error_exception_1.ApplicationException {
    constructor(message = "Forbidden", cause = {}) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
class TooManyRequsetException extends error_exception_1.ApplicationException {
    constructor(message = "Too Many Requests", cause = {}) {
        super(message, 429, cause);
    }
}
exports.TooManyRequsetException = TooManyRequsetException;
