import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export const ERROR_NAME = "ForbiddenError";

export class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.FORBIDDEN, message);
    this.name = ERROR_NAME;
  }
}
