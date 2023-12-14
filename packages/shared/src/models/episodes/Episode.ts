import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { ResourceSchema } from "../resource";
import { TimeRangeSchema } from "../resource/PartialSchemas";
import { SerieSchema } from "../series";
import { FileInfoSchema } from "./fileinfo";

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
    fileInfo: FileInfoSchema.optional(),
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