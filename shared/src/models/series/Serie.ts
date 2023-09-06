import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";

export type ModelId = string;

export const ModelSchema = z.object( {
  id: z.string(),
  name: z.string(),
} ).strict();

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: unknown): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}
