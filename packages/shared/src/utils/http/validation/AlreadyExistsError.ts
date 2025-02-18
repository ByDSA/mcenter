import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export const ERROR_NAME = "AlreadyExistsError";

export class AlreadyExistsError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.CONFLICT, message);
    this.name = ERROR_NAME;
  }
}
