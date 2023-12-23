/* eslint-disable import/no-extraneous-dependencies */
import { assertZodPopStack } from "#shared/utils/validation/zod";
import { z } from "zod";

// Dependencies
const LocalFileSchema = z.object( {
  path: z.string(),
} );
const PickableSchema = z.object( {
  weight: z.number(),
} );
const TaggableSchema = z.object( {
  tags: z.array(z.string()).optional(),
} );

export const ResourceSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} ).merge(LocalFileSchema)
  .merge(PickableSchema)
  .merge(TaggableSchema);
const DateSchema = z.date().or(z.string().pipe(z.coerce.date()));

export const FileInfoSchema = z.object( {
  path: z.string(),
  hash: z.string()
    .refine((hash) => (hash && /^[a-f0-9]{32}$/.test(hash)) || !hash, {
      message: "hash must be a md5 hash",
    } ),
  size: z.number(),
  timestamps: z.object( {
    createdAt: DateSchema,
    updatedAt: DateSchema,
  } ).strict(),
} ).strict();

// End Dependencies

export const ModelSchema = z.object( {
  artist: z.string(),
  url: z.string(),
  mediaInfo: z.object( {
    duration: z.number().nullable(),
  } ).strict(),
  game: z.string().optional(),
  year: z.number().int()
    .optional(),
  country: z.string().optional(),
  todo: z.string().optional(),
} )
// TODO: quitar FileInfo de aquí y ponerlo en un 'fileInfoAudio'
  .merge(FileInfoSchema)
  .merge(ResourceSchema)
  .merge(PickableSchema)
  .merge(LocalFileSchema)
  .merge(TaggableSchema);

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: unknown, msg?: string): asserts model is Model {
  assertZodPopStack(ModelSchema, model, msg);
}

export function parseModel(model: unknown): Model {
  return ModelSchema.parse(model);
}