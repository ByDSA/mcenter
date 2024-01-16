import { z } from "zod";

export function generatePatchBody<T extends z.ZodRawShape>(entitySchema: z.ZodObject<T>) {
  const keys = Object.keys(entitySchema.shape);
  const ret = z.object( {
    entity: entitySchema.partial().strict(),
    unset: z.array(z.string().refine(check => keys.includes(check))).optional(),
  } );

  return ret;
}