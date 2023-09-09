const enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    UNPROCESSABLE_ENTITY = 422,
    CONFLICT = 409,
    METHOD_NOT_ALLOWED = 405,
    FORBIDDEN = 403,
}

export default HttpStatusCode;
