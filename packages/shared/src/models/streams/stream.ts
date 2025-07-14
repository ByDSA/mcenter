import z from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { serieEntitySchema } from "../series";

enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

type ModelId = string;

enum OriginType {
  SERIE = "serie",
  STREAM = "stream"
};

const originSerieSchema = z.object( {
  type: z.literal(OriginType.SERIE),
  id: z.string(),
  serie: serieEntitySchema.optional(),
} ).strict();
const originStreamSchema = z.object( {
  type: z.literal(OriginType.STREAM),
  id: z.string(),
} )
  .strict();
const originSchema = originSerieSchema
  .or(originStreamSchema);

type Origin = z.infer<typeof originSchema>;

const groupSchema = z.object( {
  origins: z.array(originSchema),
} ).strict();

type Group = z.infer<typeof groupSchema>;

const modelSchema = z.object( {
  id: z.string(),
  group: groupSchema,
  mode: z.nativeEnum(Mode),
} ).strict();

type Model = z.infer<typeof modelSchema>;

function assertIsModel(model: unknown): asserts model is Model {
  assertZodPopStack(modelSchema, model);
}

export {
  ModelId as StreamId,
  Model as Stream,
  modelSchema as streamSchema,
  OriginType as StreamOriginType,
  Group as StreamGroup,
  Origin as StreamOrigin,
  Mode as StreamMode,
  assertIsModel as assertIsStream,
};
