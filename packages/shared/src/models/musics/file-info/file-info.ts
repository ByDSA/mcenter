import z from "zod";
import { genAssertZod } from "../../../utils/validation/zod";
import { mongoDbId } from "../../../models/resource/partial-schemas";
import { fileInfoSchema, compareFileInfo } from "../../file-info-common/file-info";

const schema = fileInfoSchema
  .extend( {
    mediaInfo: z.object( {
      duration: z.number().nullable(),
    } ).strict(),
    musicId: mongoDbId,
  } )
  .strict();
const entitySchema = schema.extend( {
  id: mongoDbId,
} ).strict();

type Model = z.infer<typeof schema>;

type Entity = z.infer<typeof entitySchema>;

const assertIsModel = genAssertZod(schema);
const assertIsEntity = genAssertZod(entitySchema);

type ModelOmitMusicId = Omit<Model, "musicId">;

function compareModelOmitMusicId(a: ModelOmitMusicId, b: ModelOmitMusicId): boolean {
  const sameMediaInfo = a.mediaInfo.duration === b.mediaInfo.duration;

  return compareFileInfo(a, b) && sameMediaInfo;
}

export {
  schema as musicFileInfoSchema,
  entitySchema as musicFileInfoEntitySchema,
  Model as MusicFileInfo,
  Entity as MusicFileInfoEntity,
  ModelOmitMusicId as MusicFileInfoOmitMusicId,
  assertIsModel as assertIsMusicFileInfo,
  assertIsEntity as assertIsMusicFileInfoEntity,
  compareModelOmitMusicId as compareMusicFileInfoOmitEpisodeId,
};
