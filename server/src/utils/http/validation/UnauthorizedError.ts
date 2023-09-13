import HttpStatusCode from "#shared/utils/http/StatusCode";
import HttpError from "./HttpError";

export const ErrorName = "UnauthorizedError";

export default class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.UNAUTHORIZED, message);
    this.name = ErrorName;
  }
}
