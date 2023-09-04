import { throwErrorPopStack } from "#utils/errors";
import { isDefined } from "#utils/validation";
import HttpStatusCode from "../StatusCode";
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