import z from "zod";
import { serieEntitySchema } from "../series";
import { mongoDbId } from "../resource/partial-schemas";

enum Mode {
  SEQUENTIAL = "SEQUENTIAL",
  RANDOM = "RANDOM"
}

enum OriginType {
  SERIE = "serie",
  STREAM = "stream"
};

const originSerieSchema = z.object( {
  type: z.literal(OriginType.SERIE),
  id: z.string(), // seriesKey
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
  key: z.string(),
  group: groupSchema,
  mode: z.nativeEnum(Mode),
} ).strict();

type Model = z.infer<typeof modelSchema>;

const entitySchema = modelSchema.extend( {
  id: mongoDbId,
} );

type Entity = z.infer<typeof entitySchema>;

function getSeriesKeyFromStream(stream: Model): string | null {
  let firstSerie;

  for (const o of stream.group.origins) {
    if (o.type === "serie") {
      firstSerie = o.id;
      break;
    }
  }

  return firstSerie ?? null;
}

export {
  Model as Stream,
  modelSchema as streamSchema,
  OriginType as StreamOriginType,
  Group as StreamGroup,
  Origin as StreamOrigin,
  Mode as StreamMode,
  entitySchema as streamEntitySchema,
  Entity as StreamEntity,
  getSeriesKeyFromStream,
};
