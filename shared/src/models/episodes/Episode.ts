import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { resourceSchema } from "../resource";
import { canDurableSchema } from "../resource/CanDurable";
import { FileInfoSchema } from "./fileinfo";

export type ModelId = string;

export const ModelFullIdSchema = z.object( {
  episodeId: z.string(),
  serieId: z.string(),
} ).strict();

export type ModelFullId = z.infer<typeof ModelFullIdSchema>;

export const ModelSchema = resourceSchema
  .merge(ModelFullIdSchema)
  .merge(canDurableSchema)
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