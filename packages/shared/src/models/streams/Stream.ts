import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { SerieSchema } from "../series";

export enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

export type ModelId = string;

export enum OriginType {
  SERIE = "serie",
  STREAM = "stream"
};

const originSerieSchema = z.object( {
  type: z.literal(OriginType.SERIE),
  id: z.string(),
  serie: SerieSchema.optional(),
} ).strict();
const originStreamSchema = z.object( {
  type: z.literal(OriginType.STREAM),
  id: z.string(),
} )
  .strict();
const originSchema = originSerieSchema
  .or(originStreamSchema);

export type Origin = z.infer<typeof originSchema>;

const groupSchema = z.object( {
  origins: z.array(originSchema),
} ).strict();

export type Group = z.infer<typeof groupSchema>;

export const modelSchema = z.object( {
  id: z.string(),
  group: groupSchema,
  mode: z.nativeEnum(Mode),
} ).strict();

export type Stream = z.infer<typeof modelSchema>;

export function assertIsModel(model: unknown): asserts model is Stream {
  assertZodPopStack(modelSchema, model);
}
