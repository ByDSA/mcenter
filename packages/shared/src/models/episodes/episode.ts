import z from "zod";
import { resourceSchema } from "../resources";
import { mongoDbId } from "../resources/partial-schemas";
import { imageCoverEntitySchema } from "../image-covers";
import { seriesEntitySchema } from "./series";
import { episodeFileInfoEntitySchema } from "./file-info";
import { episodeUserInfoEntitySchema } from "./user-info/user-info";

/* Model */
const episodeKeySchema = z.string();

type EpisodeKey = z.infer<typeof episodeKeySchema>;

const modelSchema = resourceSchema.extend( {
  episodeKey: episodeKeySchema,
  seriesId: mongoDbId,
  imageCoverId: mongoDbId.nullable().optional(),
  count: z.number().optional(),
} );

type Model = z.infer<typeof modelSchema>;

/* Entity */
const entitySchema = modelSchema
  .extend( {
    id: mongoDbId,
    series: seriesEntitySchema.optional(),
    fileInfos: z.array(episodeFileInfoEntitySchema).optional(),
    userInfo: episodeUserInfoEntitySchema.optional(),
    imageCover: imageCoverEntitySchema.optional(),
  } );

type Entity = z.infer<typeof entitySchema>;

export function compareEpisodeIds(episodeId1: string, episodeId2: string): boolean {
  return episodeId1 === episodeId2;
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

const episodesBySeasonSchema = z.record(
  z.array(entitySchema),
);

type EpisodesBySeason = z.infer<typeof episodesBySeasonSchema>;

export {
  modelSchema as episodeSchema,
  entitySchema as episodeEntitySchema,
  entityWithFileInfos as episodeEntityWithFileInfosSchema,
  type Model as Episode,
  type EpisodeKey,
  type Entity as EpisodeEntity,
  type EntityWithFileInfos as EpisodeEntityWithFileInfos,
  entityWithUserInfoSchema as episodeEntityWithUserInfoSchema,
  type EntityWithUserInfo as EpisodeEntityWithUserInfo,
  episodesBySeasonSchema,
  type EpisodesBySeason,
};
