import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export const ERROR_NAME = "UnauthorizedError";

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.UNAUTHORIZED, message);
    this.name = ERROR_NAME;
  }
}
