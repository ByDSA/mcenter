import z from "zod";
import { genAssertZod } from "../../../utils/validation/zod";
import { fileInfoSchema, compareFileInfo } from "../../file-info-common/file-info";
import { mongoDbId } from "../../resources/partial-schemas";

const videoMediaInfoSchema = z.object( {
  duration: z.number().nullable(),
  resolution: z.object( {
    width: z.number().nullable(),
    height: z.number().nullable(),
  } ).strict(),
  fps: z.string().nullable(),
} ).strict();
const schema = fileInfoSchema
  .extend( {
    mediaInfo: videoMediaInfoSchema,
    movieId: mongoDbId,
  } )
  .strict();
const entitySchema = schema.extend( {
  id: mongoDbId,
} ).strict();

type Model = z.infer<typeof schema>;

type Entity = z.infer<typeof entitySchema>;

const assertIsModel = genAssertZod(schema);
const assertIsEntity = genAssertZod(entitySchema);

type ModelOmitMovieId = Omit<Model, "movieId">;

function compareModelOmitMovieId(a: ModelOmitMovieId, b: ModelOmitMovieId): boolean {
  const sameMediaInfo = a.mediaInfo.duration === b.mediaInfo.duration
    && a.mediaInfo.resolution?.width === b.mediaInfo.resolution?.width
    && a.mediaInfo.resolution?.height === b.mediaInfo.resolution?.height
    && a.mediaInfo.fps === b.mediaInfo.fps;

  return compareFileInfo(a, b) && sameMediaInfo;
}

export {
  schema as movieFileInfoSchema,
  entitySchema as movieFileInfoEntitySchema,
  type Model as MovieFileInfo,
  type ModelOmitMovieId as MovieFileInfoOmitMovieId,
  type Entity as MovieFileInfoEntity,
  assertIsModel as assertIsMovieFileInfo,
  assertIsEntity as assertIsMovieFileInfoEntity,
  compareModelOmitMovieId as compareMovieFileInfoOmitMovieId,
};
