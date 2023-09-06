import { DateTypeSchema } from "#shared/utils/time";
import { assertZodPopStack } from "#shared/utils/validation/zod";
import { z } from "zod";

export const OldDateTypeSchema = DateTypeSchema.extend( {
  timestamp: z.number().optional(),
} ).strict();

export const HistoryEntryInStreamSchema = z.object( {
  episodeId: z.string(),
  date: OldDateTypeSchema,
} ).strict();

/**
 * @deprecated
 */
type HistoryEntryInStream = z.infer<typeof HistoryEntryInStreamSchema>;
export default HistoryEntryInStream;

export function assertIsHistoryEntryInStream(model: unknown): asserts model is HistoryEntryInStream {
  assertZodPopStack(HistoryEntryInStreamSchema, model);
}