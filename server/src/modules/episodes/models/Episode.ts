import { resourceSchema } from "#modules/utils/resource";
import { canDurableSchema } from "#modules/utils/resource/CanDurable";
import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";

export type ModelId = string;

export const ModelFullIdSchema = z.object( {
  episodeId: z.string(),
  serieId: z.string(),
} ).strict();

export type ModelFullId = z.infer<typeof ModelFullIdSchema>;

const ModelSchema = resourceSchema.merge(ModelFullIdSchema).merge(canDurableSchema);

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