import HttpStatusCode from "../StatusCode";
import HttpError from "./HttpError";

export const AlreadyExistsErrorName = "AlreadyExistsError";

export default class AlreadyExistsError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.CONFLICT, message);
    this.name = AlreadyExistsErrorName;
  }
}
