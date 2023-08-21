/* eslint-disable import/prefer-default-export */
import NotFoundError from "../http/errors/NotFoundError";

export function assertFound<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (!value)
    throw new NotFoundError(msg);
}