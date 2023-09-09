import HttpStatusCode from "#shared/utils/http/StatusCode";
import HttpError from "./HttpError";

export const ErrorName = "MethodNotAllowedError";

export default class MethodNotAllowedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.METHOD_NOT_ALLOWED, message);
    this.name = ErrorName;
  }
}
