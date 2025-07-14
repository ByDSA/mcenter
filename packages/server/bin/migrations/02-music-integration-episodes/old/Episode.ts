/* eslint-disable no-use-before-define */
import z from "zod";

/* Dependencias */
const resourceSchema = z.object( {
  title: z.string(),
  path: z.string(),
  weight: z.number(),
  start: z.number(),
  end: z.number(),
  tags: z.array(z.string()).optional(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} );
const canDurableSchema = z.object( {
  start: z.number(),
  end: z.number(),
} );
const SerieSchema = z.object( {
  id: z.string(),
  name: z.string(),
} ).strict();
const FileInfoSchema = z.object( {
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

/* Fin dependencias */

export type ModelId = string;

export const ModelFullIdSchema = z.object( {
  episodeId: z.string(),
  serieId: z.string(),
  serie: SerieSchema.optional(),
} ).strict();

export type ModelFullId = z.infer<typeof ModelFullIdSchema>;

export const ModelSchema = resourceSchema
  .merge(ModelFullIdSchema)
  .merge(canDurableSchema)
  .merge(z.object( {
    fileInfo: FileInfoSchema.optional(),
  } ));

type Model = z.infer<typeof ModelSchema>;
export default Model;