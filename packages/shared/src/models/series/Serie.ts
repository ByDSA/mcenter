import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";

export type SerieId = string;

export const serieSchema = z.object( {
  id: z.string(),
  name: z.string(),
} ).strict();

export type Serie = z.infer<typeof serieSchema>;

export function assertIsSerie(model: unknown): asserts model is Serie {
  assertZodPopStack(serieSchema, model);
}
