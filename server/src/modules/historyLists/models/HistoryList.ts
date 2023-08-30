import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";
import { EntrySchema } from "./HistoryEntry";

const ModelSchema = z.object( {
  id: z.string(),
  entries: z.array(EntrySchema),
  maxSize: z.number(),
} ).strict();

export type ModelId = string;

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: Model): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}