import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export const ERROR_NAME = "MethodNotAllowedError";

export class MethodNotAllowedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.METHOD_NOT_ALLOWED, message);
    this.name = ERROR_NAME;
  }
}
