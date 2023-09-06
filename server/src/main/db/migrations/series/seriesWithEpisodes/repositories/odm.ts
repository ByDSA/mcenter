import { MongoSchema } from "#main/db/migrations/utils";
import { assertZodPopStack } from "#shared/utils/validation/zod";
import { z } from "zod";
import { EpisodeInSerieSchema } from "../models/SerieWithEpisodes";

const EpisodeInSerieSchemaOdm = EpisodeInSerieSchema.merge(MongoSchema).strict();

/**
 * @deprecated
 */
export type EpisodeInSerieDocOdm = z.infer<typeof EpisodeInSerieSchemaOdm>;

const SerieWithEpisodesDocOdmSchema = MongoSchema.extend( {
  id: z.string(),
  name: z.string(),
  episodes: z.array(EpisodeInSerieSchemaOdm),
} ).strict();

/**
 * @deprecated
 */
export type SerieWithEpisodesDocODM = z.infer<typeof SerieWithEpisodesDocOdmSchema>;

export function assertIsEpisodeInSerieDocOdm(model: unknown): asserts model is EpisodeInSerieDocOdm {
  assertZodPopStack(EpisodeInSerieSchemaOdm, model);
}

export function assertIsSerieWithEpisodesDocOdm(model: unknown): asserts model is SerieWithEpisodesDocODM {
  assertZodPopStack(SerieWithEpisodesDocOdmSchema, model);
}