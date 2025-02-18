import { z } from "zod";
import { dateTypeSchema } from "../../utils/time";
import { assertZodPopStack } from "../../utils/validation/zod";
import { EpisodeIdSchema, EpisodeSchema } from "../episodes";
import { SerieSchema } from "../series";

export const entrySchema = z.object( {
  episodeId: EpisodeIdSchema,
  date: dateTypeSchema,
  serie: SerieSchema.optional(),
  episode: EpisodeSchema.optional(),
} ).strict();

export const entryWithIdSchema = entrySchema.extend( {
  id: z.string(),
  historyListId: z.string(),
} ).strict();

export type HistoryEntry = z.infer<typeof entrySchema>;

export type EntryId = string;

export type EntryWithId = z.infer<typeof entryWithIdSchema>;

export function assertIsHistoryEntry(model: unknown): asserts model is HistoryEntry {
  assertZodPopStack(entrySchema, model);
}

export function assertIsHistoryEntryWithId(model: unknown): asserts model is EntryWithId {
  assertZodPopStack(entryWithIdSchema, model);
}
