import z from "zod";
import { Schema as FileInfoSchema, compareModel as compareFileInfo } from "./FileInfo";

export const Schema = FileInfoSchema.extend( {
  mediaInfo: z.object( {
    duration: z.number().nullable(),
    resolution: z.object( {
      width: z.number().nullable(),
      height: z.number().nullable(),
    } ).strict(),
    fps: z.string().nullable(),
  } ).strict(),
} ).strict();
const SchemaWithSuperId = Schema.extend( {
  episodeId: z.string()
    .refine((id) => /^[a-f0-9]{24}$/.test(id), {
      message: "episodeId must be a mongodb id",
    } ),
} ).strict();

export type Model = z.infer<typeof Schema>;

export type ModelWithSuperId = z.infer<typeof SchemaWithSuperId>;

export type SuperId = ModelWithSuperId["episodeId"];

export function assertIsModel(model: unknown): asserts model is Model {
  Schema.parse(model);
}

export function assertIsModelWithSuperId(model: unknown): asserts model is ModelWithSuperId {
  SchemaWithSuperId.parse(model);
}

export function compareModel(a: Model, b: Model): boolean {
  const sameMediaInfo = a.mediaInfo.duration === b.mediaInfo.duration && a.mediaInfo.resolution?.width === b.mediaInfo.resolution?.width && a.mediaInfo.resolution?.height === b.mediaInfo.resolution?.height && a.mediaInfo.fps === b.mediaInfo.fps;

  return compareFileInfo(a, b) && sameMediaInfo;
}