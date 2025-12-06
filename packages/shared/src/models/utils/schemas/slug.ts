import z from "zod";

export const slugSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9-]+$/);
