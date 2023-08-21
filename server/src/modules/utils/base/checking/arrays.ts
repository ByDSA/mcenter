export function hasItems<T>(value: T[]): boolean {
  return value.length > 0;
}

export function assertHasItems<T>(value: T[], msg?: string): asserts value is T[] {
  if (!hasItems(value))
    throw new Error(msg ?? "No items found");
}