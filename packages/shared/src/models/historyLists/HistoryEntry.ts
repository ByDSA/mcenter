import { z } from "zod";
import { DateTypeSchema } from "../../utils/time";
import { assertZodPopStack } from "../../utils/validation/zod";
import { EpisodeIdSchema, EpisodeSchema } from "../episodes";
import { SerieSchema } from "../series";

export const EntrySchema = z.object( {
  episodeId: EpisodeIdSchema,
  date: DateTypeSchema,
  serie: SerieSchema.optional(),
  episode: EpisodeSchema.optional(),
} ).strict();

export const EntryWithIdSchema = EntrySchema.extend( {
  id: z.string(),
  historyListId: z.string(),
} ).strict();

type Entry = z.infer<typeof EntrySchema>;
export default Entry;

export type EntryId = string;

export type EntryWithId = z.infer<typeof EntryWithIdSchema>;

export function assertIsEntry(model: unknown): asserts model is Entry {
  assertZodPopStack(EntrySchema, model);
}

export function assertIsEntryWithId(model: unknown): asserts model is EntryWithId {
  assertZodPopStack(EntryWithIdSchema, model);
}