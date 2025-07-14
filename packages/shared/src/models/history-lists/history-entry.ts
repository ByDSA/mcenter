import type { HistoryListEntity } from "./history-list";
import z from "zod";
import { dateTypeSchema } from "../../utils/time";
import { assertZodPopStack } from "../../utils/validation/zod";
import { episodeEntitySchema, episodeIdSchema } from "../episodes";
import { serieEntitySchema } from "../series";

export const historyEntryIdSchema = z.string();

export type HistoryEntryId = z.infer<typeof historyEntryIdSchema>;

export const historyEntrySchema = z.object( {
  episodeId: episodeIdSchema,
  date: dateTypeSchema,
} ).strict();

export type HistoryEntry = z.infer<typeof historyEntrySchema>;

export function assertIsHistoryEntry(model: unknown): asserts model is HistoryEntry {
  assertZodPopStack(historyEntrySchema, model);
}

export const historyEntryEntitySchema = historyEntrySchema
  .extend( {
    historyListId: z.string(),
    serie: serieEntitySchema.optional(),
    episode: episodeEntitySchema.optional(),
  } )
  .strict();

export type HistoryEntryEntity = z.infer<typeof historyEntryEntitySchema>;

export function assertIsHistoryEntryEntity(
  model: unknown,
):
asserts model is HistoryEntryEntity {
  assertZodPopStack(historyEntryEntitySchema, model);
}

export function historyEntryToEntity(
  entry: HistoryEntry,
  historyList: HistoryListEntity,
): HistoryEntryEntity {
  return {
    ...entry,
    historyListId: historyList.id,
  };
}
