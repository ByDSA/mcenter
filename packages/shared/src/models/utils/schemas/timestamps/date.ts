import z from "zod";

export const dateSchema = z.preprocess(
  (val) => {
    if (typeof val === "string")
      return new Date(val);

    return val;
  },
  z.date(),
);
