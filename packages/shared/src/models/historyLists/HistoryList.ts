import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { entryWithIdSchema } from "./HistoryEntry";

const modelSchema = z.object( {
  id: z.string(),
  entries: z.array(entryWithIdSchema),
  maxSize: z.number(),
} ).strict();

export type HistoryListId = string;

export type HistoryList = z.infer<typeof modelSchema>;

export function assertIsHistoryList(model: HistoryList): asserts model is HistoryList {
  assertZodPopStack(modelSchema, model);
}

export {
  modelSchema as historyListSchema,
};
