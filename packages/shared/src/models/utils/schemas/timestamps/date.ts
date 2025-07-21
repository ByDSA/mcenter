import z from "zod";

export const dateSchema = z.date()
  .or(
    z.string().transform((str) => new Date(str)),
  )
  .or(
    z.any().transform((obj) => new Date(obj.toString())),
  );
