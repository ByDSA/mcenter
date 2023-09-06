import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";

export enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

export type ModelId = string;

export enum OriginType {
  SERIE = "serie",
  STREAM = "stream"
};

const OriginSchema = z.object( {
  type: z.nativeEnum(OriginType),
  id: z.string(),
} ).strict();

export type Origin = z.infer<typeof OriginSchema>;

const GroupSchema = z.object( {
  origins: z.array(OriginSchema),
} ).strict();

export type Group = z.infer<typeof GroupSchema>;

const ModelSchema = z.object( {
  id: z.string(),
  group: GroupSchema,
  mode: z.nativeEnum(Mode),
} ).strict();

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: unknown): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}