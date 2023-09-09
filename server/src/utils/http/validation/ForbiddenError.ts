import HttpStatusCode from "#shared/utils/http/StatusCode";
import HttpError from "./HttpError";

export const ErrorName = "ForbiddenError";

export default class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.FORBIDDEN, message);
    this.name = ErrorName;
  }
}
