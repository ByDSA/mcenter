export function stringToNumberOrUndefined(v: string | undefined) {
  if (v === undefined)
    return undefined;

  const parsed = +v;

  if (Number.isNaN(parsed))
    return undefined;

  return parsed;
}

export function numberToStringOrEmpty(v: number | undefined) {
  if (v === undefined)
    return "";

  return v.toString();
}