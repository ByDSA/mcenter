import z from "zod";
import { genAssertZod } from "../../validation/zod";

export const dateTypeSchema = z.object( {
  year: z.number().min(1970),
  month: z.number()
    .min(1)
    .max(12),
  day: z.number()
    .min(1)
    .max(31),
  timestamp: z.number()
    .min(0),
} ).strict();

export type DateType = z.infer<typeof dateTypeSchema>;

export const assertIsDateType = genAssertZod(dateTypeSchema);

export function getDateNow(): DateType {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    year,
    month,
    day,
    timestamp,
  };
}
