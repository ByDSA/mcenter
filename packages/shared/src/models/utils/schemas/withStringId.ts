import { z } from "zod";

export function withStringId<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.extend( {
    id: z.string(),
  } ).strict();
}
