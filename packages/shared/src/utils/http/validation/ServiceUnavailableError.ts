import { HttpStatusCode } from "../StatusCode";
import { HttpError } from "./HttpError";

export class ServiceUnavailableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.SERVICE_UNAVAILABLE, message);
    this.name = ServiceUnavailableError.name;
  }
}
