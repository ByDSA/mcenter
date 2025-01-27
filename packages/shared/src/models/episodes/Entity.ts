import { z } from "zod";
import { AssertZodSettings, assertZodPopStack } from "../../utils/validation/zod";
import { SerieSchema } from "../series";
import { voSchema } from "./VO";

export const idSchema = z.object( {
  innerId: z.string(),
  serieId: z.string(),
} ).strict();

export type Id = z.infer<typeof idSchema>;

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
export const entitySchema = voSchema
  .merge(z.object( {
    id: idSchema,
    serie: SerieSchema.optional(),
  } ));

export type Episode = z.infer<typeof entitySchema>;

export function compareEpisodeId(a: Id, b: Id): boolean {
  return a.innerId === b.innerId && a.serieId === b.serieId;
}

export function assertIsEpisode(
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is Episode {
  assertZodPopStack(entitySchema, model, settings);
}
