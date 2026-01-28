import z from "zod";
import { resourceSchema } from "../resources";
import { serieEntitySchema, seriesKeySchema } from "../series";
import { mongoDbId } from "../resources/partial-schemas";
import { imageCoverEntitySchema } from "../image-covers";
import { episodeFileInfoEntitySchema } from "./file-info";
import { episodeUserInfoEntitySchema } from "./user-info/user-info";

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
  imageCoverId: mongoDbId.nullable().optional(),
} );

type Model = z.infer<typeof modelSchema>;

/* Entity */
const entitySchema = modelSchema
  .extend( {
    id: mongoDbId,
    serie: serieEntitySchema.optional(),
    fileInfos: z.array(episodeFileInfoEntitySchema).optional(),
    userInfo: episodeUserInfoEntitySchema.optional(),
    imageCover: imageCoverEntitySchema.optional(),
  } );

type Entity = z.infer<typeof entitySchema>;

export function compareEpisodeCompKey(a: CompKey, b: CompKey): boolean {
  return a.episodeKey === b.episodeKey && a.seriesKey === b.seriesKey;
}

/* With File Infos */
const entityWithFileInfos = entitySchema.required( {
  fileInfos: true,
} );

type EntityWithFileInfos = z.infer<typeof entityWithFileInfos>;

const entityWithUserInfoSchema = entitySchema.required( {
  userInfo: true,
} );

type EntityWithUserInfo = z.infer<typeof entityWithUserInfoSchema>;

export {
  modelSchema as episodeSchema,
  entitySchema as episodeEntitySchema,
  compKeySchema as episodeCompKeySchema,
  entityWithFileInfos as episodeEntityWithFileInfosSchema,
  type Model as Episode,
  type EpisodeKey,
  type CompKey as EpisodeCompKey,
  type Entity as EpisodeEntity,
  type EntityWithFileInfos as EpisodeEntityWithFileInfos,
  entityWithUserInfoSchema as episodeEntityWithUserInfoSchema,
  type EntityWithUserInfo as EpisodeEntityWithUserInfo,
};
