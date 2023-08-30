import { StreamMode } from "#modules/streams";
import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";
import { HistoryEntryInStreamSchema } from "./HistoryEntryInStream";

export const StreamWithHistoryListSchema = z.object( {
  id: z.string(),
  group: z.string(),
  mode: z.nativeEnum(StreamMode),
  maxHistorySize: z.number(),
  history: z.array(HistoryEntryInStreamSchema),
} ).strict();

/**
 * @deprecated
 */
type StreamWithHistoryList = z.infer<typeof StreamWithHistoryListSchema>;
export default StreamWithHistoryList;

export function assertIsStreamWithHistoryList(model: unknown): asserts model is StreamWithHistoryList {
  assertZodPopStack(StreamWithHistoryListSchema, model);
}