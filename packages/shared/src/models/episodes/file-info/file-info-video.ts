import z from "zod";
import { timestampsFileSchema } from "../../utils/schemas/Timestamps";
import { fileInfoSchema, compareFileInfo } from "./file-info";

const mongoDbIdRefining = [
  ((id: any) => /^[a-f0-9]{24}$/.test(id)),
  {
    message: "id must be a mongodb id",
  },
] as const;
const schema = fileInfoSchema.extend( {
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
  // eslint-disable-next-line max-len
  timestamps: timestampsFileSchema, // TODO: quitarlo de aquí y ponerlo en FileInfo común cuando se cree FileInfoMusic
} ).strict();
const entitySchema = schema.extend( {
  id: z.string()
    .refine(...mongoDbIdRefining),
} ).strict();

type Model = z.infer<typeof schema>;

type Entity = z.infer<typeof entitySchema>;

function assertIsModel(model: unknown): asserts model is Model {
  schema.parse(model);
}

function assertIsEntity(model: unknown): asserts model is Entity {
  entitySchema.parse(model);
}

type ModelOmitEpisodeId = Omit<Model, "episodeId">;

function compareModelOmitEpisodeId(a: ModelOmitEpisodeId, b: ModelOmitEpisodeId): boolean {
  const sameMediaInfo = a.mediaInfo.duration === b.mediaInfo.duration
   && a.mediaInfo.resolution?.width === b.mediaInfo.resolution?.width
   && a.mediaInfo.resolution?.height === b.mediaInfo.resolution?.height
   && a.mediaInfo.fps === b.mediaInfo.fps;

  return compareFileInfo(a, b) && sameMediaInfo;
}

export {
  schema as fileInfoVideoSchema,
  entitySchema as fileInfoVideoEntitySchema,
  Model as FileInfoVideo,
  Entity as FileInfoVideoEntity,
  assertIsModel as assertIsFileInfoVideo,
  assertIsEntity as assertIsFileInfoVideoEntity,
  compareModelOmitEpisodeId as compareFileInfoVideoOmitEpisodeId,
};
