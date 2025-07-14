import z from "zod";
import { AssertZodSettings, assertZodPopStack } from "../../utils/validation/zod";
import { resourceSchema, timeRangeSchema } from "../resource";
import { serieEntitySchema } from "../series";
import { fileInfoVideoSchema } from "./fileinfo";
import { EpisodeId, episodeSchema } from "./episode";

export const episodeInnerIdSchema = z.string();
const modelIdSchema = z.object( {
  innerId: episodeInnerIdSchema,
  serieId: z.string(),
} ).strict();

type ModelId = z.infer<typeof modelIdSchema>;

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
const modelSchema = resourceSchema
  .extend( {
    fileInfo: fileInfoVideoSchema.optional(),
  } )
  .merge(timeRangeSchema);

type Model = z.infer<typeof modelSchema>;

function assertIsModel(
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is Model {
  assertZodPopStack(modelSchema, model, settings);
}

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
export const episodeEntitySchema = episodeSchema
  .extend( {
    id: modelIdSchema,
    serie: serieEntitySchema.optional(),
  } );

export type EpisodeEntity = z.infer<typeof episodeEntitySchema>;

export function compareEpisodeId(a: EpisodeId, b: EpisodeId): boolean {
  return a.innerId === b.innerId && a.serieId === b.serieId;
}

export {
  modelSchema as episodeSchema,
  Model as Episode,
  ModelId as EpisodeId,
  assertIsModel as assertIsEpisode,
  modelIdSchema as episodeIdSchema,
};
