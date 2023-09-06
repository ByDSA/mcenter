import HttpStatusCode from "#shared/utils/http/StatusCode";
import HttpError from "./HttpError";

export const NotUpdatedErrorName = "NotUpdatedError";

export default class NotUpdatedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.CONFLICT, message);
    this.name = NotUpdatedErrorName;
  }
}
