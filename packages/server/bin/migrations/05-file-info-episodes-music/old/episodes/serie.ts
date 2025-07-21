import z from "zod";
import { assertZodPopStack } from "$shared/utils/validation/zod";

export const serieSchema = z.object( {
  name: z.string(),
} ).strict();

export type Serie = z.infer<typeof serieSchema>;

export function assertIsSerie(model: unknown): asserts model is Serie {
  assertZodPopStack(serieSchema, model);
}
const modelIdSchema = z.string();

export type SerieId = z.infer<typeof modelIdSchema>;

export const serieEntitySchema = serieSchema.extend( {
  id: modelIdSchema,
} );

export type SerieEntity = z.infer<typeof serieEntitySchema>;

export function assertIsSerieEntity(model: unknown): asserts model is SerieEntity {
  assertZodPopStack(serieEntitySchema, model);
}

export {
  modelIdSchema as serieIdSchema,
};
