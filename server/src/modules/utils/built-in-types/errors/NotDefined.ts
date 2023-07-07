import { errorPopStack } from "#modules/utils/others";

export class NotDefinedError extends Error {
  constructor(value: null | undefined) {
    super(`${value} is not defined`);
  }
}

export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null)
    throw errorPopStack(new NotDefinedError(value as null | undefined));
}