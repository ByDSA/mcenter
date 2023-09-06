import { ArrayOneOrMore } from "../arrays";
import { throwErrorPopStack } from "../errors";

export function isNotEmpty<T>(value: T[]): boolean {
  return value.length > 0;
}

export function isEmpty<T>(value: T[]): boolean {
  return value.length === 0;
}

export function assertIsNotEmpty<T>(value: T[], msg?: string): asserts value is ArrayOneOrMore<T> {
  if (isEmpty(value))
    throwErrorPopStack(new Error(msg ?? "Array is empty"));
}