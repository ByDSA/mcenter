import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { timestampsSchema } from "../utils/schemas/Timestamps";
import { localFileSchema, pickableSchema, taggableSchema } from "./PartialSchemas";

export const valueObjectSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
  timestamps: timestampsSchema,
} ).merge(localFileSchema)
  .merge(pickableSchema)
  .merge(taggableSchema);

export type ValueObject = z.infer<typeof valueObjectSchema>;

export function assertIsVO(model: unknown): asserts model is ValueObject {
  assertZodPopStack(valueObjectSchema, model);
}
