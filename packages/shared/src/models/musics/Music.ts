/* eslint-disable import/no-extraneous-dependencies */
import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";

export const ModelSchema = z.object( {
  hash: z.string(),
  title: z.string(),
  url: z.string(),
  path: z.string(),
  weight: z.number().optional(),
  artist: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.number().optional(),
  disabled: z.boolean().optional(),
} );

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: unknown, msg?: string): asserts model is Model {
  assertZodPopStack(ModelSchema, model, msg);
}