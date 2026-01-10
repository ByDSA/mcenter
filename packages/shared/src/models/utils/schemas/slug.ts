import z from "zod";

export const SLUG_MAX_LENGTH = 100;

export const slugSchema = z.string()
  .min(1)
  .max(SLUG_MAX_LENGTH)
  .regex(/^[a-zA-Z0-9-]+$/);
