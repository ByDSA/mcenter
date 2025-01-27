import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export const UNPROCESSABLE_ENTITY_ERROR_NAME = "UnprocessablEntityError";

export class UnprocessableEntityError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.UNPROCESSABLE_ENTITY, message);
    this.name = UNPROCESSABLE_ENTITY_ERROR_NAME;
  }
}
