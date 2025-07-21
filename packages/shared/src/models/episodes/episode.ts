import z from "zod";
import { genAssertZod } from "../../utils/validation/zod";
import { resourceSchema } from "../resource";
import { serieEntitySchema, seriesKeySchema } from "../series";
import { episodeFileInfoEntitySchema } from "./file-info";

/* Model */
const episodeKeySchema = z.string();

type EpisodeKey = z.infer<typeof episodeKeySchema>;
const compKeySchema = z.object( {
  episodeKey: episodeKeySchema,
  seriesKey: seriesKeySchema,
} ).strict();

type CompKey = z.infer<typeof compKeySchema>;
const modelSchema = resourceSchema.extend( {
  compKey: compKeySchema,
} );

type Model = z.infer<typeof modelSchema>;

/* Entity */
const modelIdSchema = z.string();

type ModelId = z.infer<typeof modelIdSchema>;
const entitySchema = modelSchema
  .extend( {
    id: modelIdSchema,
    serie: serieEntitySchema.optional(),
    fileInfos: z.array(episodeFileInfoEntitySchema).optional(),
  } );

type Entity = z.infer<typeof entitySchema>;

export function compareEpisodeCompKey(a: CompKey, b: CompKey): boolean {
  return a.episodeKey === b.episodeKey && a.seriesKey === b.seriesKey;
}

const assertIsModel = genAssertZod(modelSchema);
const assertIsEntity = genAssertZod(entitySchema);

/* With File Infos */
// eslint-disable-next-line padding-line-between-statements
const entityWithFileInfos = entitySchema.required( {
  fileInfos: true,
} );

type EntityWithFileInfos = z.infer<typeof entityWithFileInfos>;

export {
  modelSchema as episodeSchema,
  entitySchema as episodeEntitySchema,
  compKeySchema as episodeCompKeySchema,
  entityWithFileInfos as episodeEntityWithFileInfosSchema,
  type Model as Episode,
  type ModelId as EpisodeId,
  type EpisodeKey,
  type CompKey as EpisodeCompKey,
  type Entity as EpisodeEntity,
  type EntityWithFileInfos as EpisodeEntityWithFileInfos,
  assertIsModel as assertIsEpisode,
  assertIsEntity as assertIsEpisodeEntity,
};
