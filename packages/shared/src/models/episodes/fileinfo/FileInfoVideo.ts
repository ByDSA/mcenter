import z from "zod";
import { timestampsFileSchema } from "../../utils/dtos/Timestamps";
import { schema as FileInfoSchema, compareModel as compareFileInfo } from "./FileInfo";

export const schema = FileInfoSchema.extend( {
  mediaInfo: z.object( {
    duration: z.number().nullable(),
    resolution: z.object( {
      width: z.number().nullable(),
      height: z.number().nullable(),
    } ).strict(),
    fps: z.string().nullable(),
  } ).strict(),
  // eslint-disable-next-line max-len
  timestamps: timestampsFileSchema, // TODO: quitarlo de aquí y ponerlo en FileInfo común cuando se cree FileInfoMusic
} ).strict();
const schemaWithSuperId = schema.extend( {
  episodeId: z.string()
    .refine((id) => /^[a-f0-9]{24}$/.test(id), {
      message: "episodeId must be a mongodb id",
    } ),
} ).strict();

export type Model = z.infer<typeof schema>;

export type ModelWithSuperId = z.infer<typeof schemaWithSuperId>;

export type SuperId = ModelWithSuperId["episodeId"];

export function assertIsModel(model: unknown): asserts model is Model {
  schema.parse(model);
}

export function assertIsModelWithSuperId(model: unknown): asserts model is ModelWithSuperId {
  schemaWithSuperId.parse(model);
}

export function compareModel(a: Model, b: Model): boolean {
  const sameMediaInfo = a.mediaInfo.duration === b.mediaInfo.duration
   && a.mediaInfo.resolution?.width === b.mediaInfo.resolution?.width
   && a.mediaInfo.resolution?.height === b.mediaInfo.resolution?.height
   && a.mediaInfo.fps === b.mediaInfo.fps;

  return compareFileInfo(a, b) && sameMediaInfo;
}
