export function removeUndefinedValues(obj: object): object {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if ((obj as any)[key] === undefined)

      delete (obj as any)[key];
  }

  return obj;
}

function isPlainObject(value: any): value is Record<string, unknown> {
  return (
    typeof value === "object"
    && value !== null
    && Object.getPrototypeOf(value) === Object.prototype
  );
}

export function removeUndefinedDeep<T>(obj: T): T {
  if (Array.isArray(obj))
    return obj.map(removeUndefinedDeep) as unknown as T;

  if (isPlainObject(obj)) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined)
        result[key] = removeUndefinedDeep(value);
    }

    return result as T;
  }

  // Para todo lo demás (Date, Map, Set, clases, primitivos...)
  return obj;
}
