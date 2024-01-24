import { z } from "zod";
import { AssertZodSettings, assertZodPopStack } from "../../utils/validation/zod";
import { SerieSchema } from "../series";
import { VOSchema } from "./VO";

export const IdSchema = z.object( {
  innerId: z.string(),
  serieId: z.string(),
} ).strict();

export type Id = z.infer<typeof IdSchema>;

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
export const EntitySchema = VOSchema
  .merge(z.object( {
    id: IdSchema,
    serie: SerieSchema.optional(),
  } ));

export type Entity = z.infer<typeof EntitySchema>;

export function compareId(a: Id, b: Id): boolean {
  return a.innerId === b.innerId && a.serieId === b.serieId;
}

export function assertIsModel(model: unknown, settings?: AssertZodSettings): asserts model is Entity {
  assertZodPopStack(EntitySchema, model, settings);
}