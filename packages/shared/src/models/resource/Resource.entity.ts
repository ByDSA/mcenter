import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { LocalFileSchema, PickableSchema, TaggableSchema } from "./PartialSchemas";

export const ModelSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} ).merge(LocalFileSchema)
  .merge(PickableSchema)
  .merge(TaggableSchema);

type Model = z.infer<typeof ModelSchema>;

export default Model;

export function assertIsResource(model: unknown): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}