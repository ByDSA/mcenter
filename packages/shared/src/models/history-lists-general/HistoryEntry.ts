import { z } from "zod";
import { dateTypeSchema } from "../../utils/time";

export function makeEntrySchema<T extends z.ZodTypeAny, U extends z.ZodTypeAny>(
  resourceId: T,
  resource: U,
) {
  return z.object( {
    resourceId,
    resource: resource.optional(),
    date: dateTypeSchema,
  } ).strict();
}
