import HttpStatusCode from "#shared/utils/http/StatusCode";
import HttpError from "./HttpError";

export default class ServiceUnavailableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.SERVICE_UNAVAILABLE, message);
    this.name = ServiceUnavailableError.name;
  }
}
