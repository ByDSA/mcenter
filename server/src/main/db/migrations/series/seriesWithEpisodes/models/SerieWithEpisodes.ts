import { assertZodPopStack } from "#shared/utils/validation/zod";
import { z } from "zod";

export const EpisodeInSerieSchema = z.object( {
  title: z.string().optional(),
  path: z.string(),
  weight: z.number().optional(),
  tags: z.array(z.string()).optional(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
  id: z.string(),
  start: z.number().optional(),
  end: z.number().optional(),
  duration: z.number().optional(),
} ).strict();

export type EpisodeInSerie = z.infer<typeof EpisodeInSerieSchema>;

const SerieWithEpisodesSchema = z.object( {
  id: z.string(),
  name: z.string(),
  episodes: z.array(EpisodeInSerieSchema),
} ).strict();

type SerieWithEpisodes = z.infer<typeof SerieWithEpisodesSchema>;
export default SerieWithEpisodes;

export function assertIsSerieWithEpisodes(model: SerieWithEpisodes): asserts model is SerieWithEpisodes {
  assertZodPopStack(SerieWithEpisodesSchema, model);
}

export function assertIsEpisodeInSerie(model: unknown): asserts model is EpisodeInSerie {
  assertZodPopStack(EpisodeInSerieSchema, model);
}