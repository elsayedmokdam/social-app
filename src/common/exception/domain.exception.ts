import { ApplicationException } from "./error.exception";

export class ConflictException extends ApplicationException {
  constructor(message: string = "Conflict", cause: { issues?: any } = {}) {
    super(message, 409, cause);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(message: string = "Not Found", cause: { issues?: any } = {}) {
    super(message, 404, cause);
  }
}

export class BadRequestException extends ApplicationException {
  constructor(message: string = "Bad Request", cause: { issues?: any } = {}) {
    super(message, 400, cause);
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message: string = "Unauthorized", cause: { issues?: any } = {}) {
    super(message, 401, cause);
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string = "Forbidden", cause: { issues?: any} = {}) {
    super(message, 403, cause)
  }
}

export class TooManyRequsetException extends ApplicationException {
  constructor(message: string = "Too Many Requests", cause: { issues?: any} = {}){
    super(message, 429, cause)
  }
}