export function assertHasKey<T extends Object>(value: T, key: string) {
  if (!(key in value))
    throw new Error(`TODO must have '${key}'`);
}

export function assertHasAnyKey<T extends Object>(value: T, keys: string[]) {
  for (const key of keys) {
    if (key in value)
      return;
  }

  throw new Error(`TODO must have any key of '${keys.join(", ")}'`);
}
