import z from "zod";
import { dateTypeSchema } from "../../utils/time";

export function makeEntrySchema<T extends z.ZodTypeAny>(
  resourceId: T,
) {
  return z.object( {
    resourceId,
    date: dateTypeSchema,
  } ).strict();
}
