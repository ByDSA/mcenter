import { throwErrorPopStack } from "src/utils/others";

export class NotDefinedError extends Error {
  constructor(value: null | undefined, msg?: string) {
    super(msg ?? `${value} is not defined`);
  }
}

export function assertIsDefined<T>(value: T, msg?: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null)
    throwErrorPopStack(new NotDefinedError(value as null | undefined, msg));
}