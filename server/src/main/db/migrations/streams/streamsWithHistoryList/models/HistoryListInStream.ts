import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";
import { HistoryEntryInStreamSchema } from "./HistoryEntryInStream";

const HistoryListInStreamSchema = z.array(HistoryEntryInStreamSchema);

/**
 * @deprecated
 */
type HistoryListInStream = z.infer<typeof HistoryListInStreamSchema>;

export default HistoryListInStream;

export function assertIsHistoryListInStream(model: unknown): asserts model is HistoryListInStream {
  assertZodPopStack(HistoryListInStreamSchema, model);
}