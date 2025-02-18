import { z } from "zod";

export function makeListSchema<T extends z.ZodTypeAny>(resource: T) {
  return z.object( {
    id: z.string(),
    entries: z.array(resource),
    maxSize: z.number().optional(),
  } ).strict();
}
