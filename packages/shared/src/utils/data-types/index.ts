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

export function stringifyUnknown(err: unknown): string {
  if (typeof err === "string")
    return err;

  if (err === null)
    return "null";

  if (err === undefined)
    return "undefined";

  if (typeof err === "object") {
    try {
      return JSON.stringify(err);
    } catch {
      // Fallback para objetos que no se pueden serializar o con referencias circulares
      try {
        return err.toString();
      } catch {
        // Último recurso si toString() también falla
        return "[Object]";
      }
    }
  }

  // Todos los demás tipos tienen toString()
  try {
    return err.toString();
  } catch {
    // Fallback final por si acaso
    return String(err);
  }
}
