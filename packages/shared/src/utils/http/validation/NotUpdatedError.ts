import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export const NOT_UPDATED_ERROR_NAME = "NotUpdatedError";

export class NotUpdatedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.CONFLICT, message);
    this.name = NOT_UPDATED_ERROR_NAME;
  }
}
