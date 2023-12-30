import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
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

type Model = z.infer<typeof EntitySchema>;
export default Model;

export function compareId(a: Id, b: Id): boolean {
  return a.innerId === b.innerId && a.serieId === b.serieId;
}

export function assertIsModel(model: unknown, msg?: string): asserts model is Model {
  assertZodPopStack(EntitySchema, model, msg);
}