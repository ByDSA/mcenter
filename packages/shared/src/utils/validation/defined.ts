import { throwErrorPopStack } from "../errors";

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

export function assertIsDefined<T>(value: T, msg?: string): asserts value is NonNullable<T> {
  if (!isDefined(value))
    throwErrorPopStack(new NotDefinedError(msg));
}

export class NotDefinedError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Value is not defined");
  }
}
