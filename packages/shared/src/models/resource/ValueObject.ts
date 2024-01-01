import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { LocalFileSchema, PickableSchema, TaggableSchema } from "./PartialSchemas";

export const ValueObjectSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} ).merge(LocalFileSchema)
  .merge(PickableSchema)
  .merge(TaggableSchema);

export type ValueObject = z.infer<typeof ValueObjectSchema>;

export function assertIsVO(model: unknown): asserts model is ValueObject {
  assertZodPopStack(ValueObjectSchema, model);
}