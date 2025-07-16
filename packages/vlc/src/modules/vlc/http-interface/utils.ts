const enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

abstract class HttpError extends Error {
  readonly code: number;

  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}

const ERROR_NAME = "UnauthorizedError";

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.UNAUTHORIZED, message);
    this.name = ERROR_NAME;
  }
}

const UNPROCESSABLE_ENTITY_ERROR_NAME = "UnprocessablEntityError";

export class UnprocessableEntityError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.UNPROCESSABLE_ENTITY, message);
    this.name = UNPROCESSABLE_ENTITY_ERROR_NAME;
  }
}
