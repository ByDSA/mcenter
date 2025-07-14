import { assertZodPopStack } from "$shared/utils/validation/zod";
import z from "zod";
import { Schema as FileInfoSchemaVideo } from "./FileInfoVideo";

/* Dependencias */
const PositiveOrZeroSchema = z.number()
  .gte(0);
const TimeRangeSchema = z.object( {
  start: PositiveOrZeroSchema.optional(),
  end: PositiveOrZeroSchema.optional(),
} );
const LocalFileSchema = z.object( {
  path: z.string(),
} );
const PickableSchema = z.object( {
  weight: z.number(),
} );
const TaggableSchema = z.object( {
  tags: z.array(z.string()).optional(),
} );
const ResourceSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} ).merge(LocalFileSchema)
  .merge(PickableSchema)
  .merge(TaggableSchema);
const SerieSchema = z.object( {
  id: z.string(),
  name: z.string(),
} ).strict();
/* Fin dependencias */

export type ModelId = string;

export const ModelFullIdSchema = z.object( {
  episodeId: z.string(),
  serieId: z.string(),
  serie: SerieSchema.optional(),
} ).strict();

export type ModelFullId = z.infer<typeof ModelFullIdSchema>;

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
export const ModelSchema = ResourceSchema
  .merge(ModelFullIdSchema)
  .merge(TimeRangeSchema)
  .merge(z.object( {
    fileInfo: FileInfoSchemaVideo.optional(),
  } ));

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function compareFullId(a: ModelFullId, b: ModelFullId): boolean {
  return a.episodeId === b.episodeId && a.serieId === b.serieId;
}

export function fullIdOf(episode: Model): ModelFullId {
  const ret = {
    episodeId: episode.episodeId,
    serieId: episode.serieId,
  };

  ModelFullIdSchema.parse(ret);

  return ret;
}

export function assertIsModel(model: unknown, msg?: string): asserts model is Model {
  assertZodPopStack(ModelSchema, model, msg);
}