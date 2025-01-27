export function removeUndefinedValues(obj: object): object {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if ((obj as any)[key] === undefined)

      delete (obj as any)[key];
  }

  return obj;
}
