import z from "zod";

export const Schema = z.object( {
  path: z.string(),
  hash: z.string().nullable()
    .refine((hash) => (hash && /^[a-f0-9]{32}$/.test(hash)) || !hash, {
      message: "hash must be a md5 hash",
    } ),
  size: z.number().nullable(),
  timestamps: z.object( {
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
  } ).strict(),
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
  const sameTimestamps = a.timestamps.createdAt?.toString() === b.timestamps.createdAt?.toString() && a.timestamps.updatedAt?.toString() === b.timestamps.updatedAt?.toString();

  return a.path === b.path && a.hash === b.hash && sameMediaInfo && a.size === b.size && sameTimestamps;
}