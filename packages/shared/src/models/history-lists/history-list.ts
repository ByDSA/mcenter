import z from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { historyEntrySchema } from "./history-entry";

const modelIdSchema = z.string();

type ModelId = z.infer<typeof modelIdSchema>;

const modelSchema = z.object( {
  id: z.string(),
  entries: z.array(historyEntrySchema),
  maxSize: z.number(),
} ).strict();

type Model = z.infer<typeof modelSchema>;

function assertIsModel(model: Model): asserts model is Model {
  assertZodPopStack(modelSchema, model);
}

export {
  modelSchema as historyListEntitySchema,
  assertIsModel as assertIsHistoryListEntity,
  Model as HistoryListEntity,
  ModelId as HistoryListId,
  modelIdSchema as historyListIdSchema,
};
