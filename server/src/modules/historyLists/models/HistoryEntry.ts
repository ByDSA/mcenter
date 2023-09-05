import { ModelFullIdSchema as EpisodeFullIdSchema, ModelSchema as EpisodeSchema } from "#modules/episodes/models";
import { SerieSchema } from "#modules/series";
import { DateTypeSchema } from "#utils/time";
import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";

export const EntrySchema = EpisodeFullIdSchema.extend( {
  date: DateTypeSchema,
  serie: SerieSchema.optional(),
  episode: EpisodeSchema.optional(),
} ).strict();

type Entry = z.infer<typeof EntrySchema>;
export default Entry;

export function assertIsEntry(model: unknown): asserts model is Entry {
  assertZodPopStack(EntrySchema, model);
}