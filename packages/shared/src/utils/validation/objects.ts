export function assertHasKey<T extends object>(value: T, key: string) {
  if (!(key in value))
    throw new Error(`Must have '${key}'`);
}

export function assertHasAnyKey<T extends object>(value: T, keys: string[]) {
  for (const key of keys) {
    if (key in value)
      return;
  }

  throw new Error(`Must have any key of '${keys.join(", ")}'`);
}

export function assertIsInstanceOf<T>(
  value: unknown,
  clazz: new (...args: any[])=> T,
): asserts value is T {
  if (!(value instanceof clazz))
    throw new Error(`Value must be an instance of '${clazz.name}'`);
}

export function isObject(item: unknown): boolean {
  return (!!item && typeof item === "object" && !Array.isArray(item));
}
