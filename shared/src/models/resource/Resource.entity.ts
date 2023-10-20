import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";

export const ModelSchema = z.object( {
  title: z.string(),
  path: z.string(),
  weight: z.number(),
  start: z.number(),
  end: z.number(),
  tags: z.array(z.string()).optional(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} );

type Model = z.infer<typeof ModelSchema>;

export default Model;

export function assertIsResource(model: unknown): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}