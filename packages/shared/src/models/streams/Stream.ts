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

const OriginSerieSchema = z.object( {
  type:z.literal(OriginType.SERIE),
  id: z.string(),
  serie: SerieSchema.optional(),
} ).strict();
const OriginStreamSchema = z.object( {
  type:z.literal(OriginType.STREAM),
  id: z.string(),
} )
  .strict();
const OriginSchema = OriginSerieSchema
  .or(OriginStreamSchema);

export type Origin = z.infer<typeof OriginSchema>;

const GroupSchema = z.object( {
  origins: z.array(OriginSchema),
} ).strict();

export type Group = z.infer<typeof GroupSchema>;

export const ModelSchema = z.object( {
  id: z.string(),
  group: GroupSchema,
  mode: z.nativeEnum(Mode),
} ).strict();

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: unknown): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}