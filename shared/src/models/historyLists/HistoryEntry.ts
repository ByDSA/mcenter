import { z } from "zod";
import { DateTypeSchema } from "../../utils/time";
import { assertZodPopStack } from "../../utils/validation/zod";
import { EpisodeFullIdSchema, EpisodeSchema } from "../episodes";
import { SerieSchema } from "../series";

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