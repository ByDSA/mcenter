export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

export function assertDefined<T>(value: T | null | undefined, name: string = "value"): asserts value is T {
  if (!isDefined(value))
    throw new Error(`${name} must be defined`);
}