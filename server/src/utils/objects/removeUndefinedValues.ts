export default function removeUndefinedValues(obj: {} ): {} {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if ((obj as any)[key] === undefined)
      // eslint-disable-next-line no-param-reassign
      delete (obj as any)[key];
  }

  return obj;
}