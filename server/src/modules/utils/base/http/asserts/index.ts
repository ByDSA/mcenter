/* eslint-disable import/prefer-default-export */
import NotFoundError from "../errors/NotFoundError";

export function assertFound<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (!value)
    throw new NotFoundError(msg);
}

export function assertHasItems<T>(value: T[] | null | undefined, msg?: string): asserts value is T[] {
  if (!value || value.length === 0)
    throw new Error(msg ?? "No items found");
}