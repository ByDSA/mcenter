import z from "zod";
import { genAssertZod } from "../../../utils/validation/zod";
import { timeRangeSchema } from "../../resource";
import { fileInfoSchema, compareFileInfo } from "../../file-info-common/file-info";
import { mongoDbIdRefining } from "../../resource/partial-schemas";

const schema = fileInfoSchema
  .merge(timeRangeSchema)
  .extend( {
    mediaInfo: z.object( {
      duration: z.number().nullable(),
      resolution: z.object( {
        width: z.number().nullable(),
        height: z.number().nullable(),
      } ).strict(),
      fps: z.string().nullable(),
    } ).strict(),
    episodeId: z.string()
      .refine(...mongoDbIdRefining),
  } )
  .strict();
const entitySchema = schema.extend( {
  id: z.string()
    .refine(...mongoDbIdRefining),
} ).strict();

type Model = z.infer<typeof schema>;

type Entity = z.infer<typeof entitySchema>;

const assertIsModel = genAssertZod(schema);
const assertIsEntity = genAssertZod(entitySchema);

type ModelOmitEpisodeId = Omit<Model, "episodeId">;

function compareModelOmitEpisodeId(a: ModelOmitEpisodeId, b: ModelOmitEpisodeId): boolean {
  const sameMediaInfo = a.mediaInfo.duration === b.mediaInfo.duration
   && a.mediaInfo.resolution?.width === b.mediaInfo.resolution?.width
   && a.mediaInfo.resolution?.height === b.mediaInfo.resolution?.height
   && a.mediaInfo.fps === b.mediaInfo.fps;

  return compareFileInfo(a, b) && sameMediaInfo;
}

export {
  schema as episodeFileInfoSchema,
  entitySchema as episodeFileInfoEntitySchema,
  Model as EpisodeFileInfo,
  Entity as EpisodeFileInfoEntity,
  assertIsModel as assertIsEpisodeFileInfo,
  assertIsEntity as assertIsEpisodeFileInfoEntity,
  compareModelOmitEpisodeId as compareEpisodeFileInfoOmitEpisodeId,
};
