import { throwErrorPopStack } from "#shared/utils/errors";
import HttpStatusCode from "#shared/utils/http/StatusCode";
import { isDefined } from "#shared/utils/validation";
import HttpError from "./HttpError";

export function assertFound<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (!isDefined(value))
    throwErrorPopStack(new NotFoundError(msg));
}

export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(HttpStatusCode.NOT_FOUND, message);
    this.name = NotFoundError.name;
  }
}