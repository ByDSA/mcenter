import z from "zod";

export const dateSchema = z.preprocess((val) => {
  if (val === null || val === "")
    return undefined;

  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);

    if (isNaN(d.getTime()))
      return undefined;

    return d;
  }

  if (val instanceof Date)
    return val;

  return undefined;
}, z.date());
