import z from "zod";

export const dateSchema = z.preprocess(
  (val) => {
    if (typeof val === "string" || typeof val === "number")
      return new Date(val);
    else if (!(val instanceof Date))
      throw new Error("Invalid date");

    return val;
  },
  z.date(),
);
