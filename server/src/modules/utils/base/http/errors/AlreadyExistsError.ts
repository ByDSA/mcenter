import StatusCode from "../StatusCode";
import HttpError from "./HttpError";

export const AlreadyExistsErrorName = "AlreadyExistsError";

export default class AlreadyExistsError extends HttpError {
  constructor(message?: string) {
    super(StatusCode.CONFLICT, message);
    this.name = AlreadyExistsErrorName;
  }
}
