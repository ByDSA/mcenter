/* eslint-disable import/no-extraneous-dependencies */
import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { FileInfoSchema } from "../episodes/fileinfo";
import { ResourceVOSchema } from "../resource";
import { LocalFileSchema, PickableSchema, TaggableSchema } from "../resource/PartialSchemas";

export const VOSchema = z.object( {
  artist: z.string(),
  album: z.string().optional(),
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
  .merge(ResourceVOSchema)
  .merge(PickableSchema)
  .merge(LocalFileSchema)
  .merge(TaggableSchema);

export type VO = z.infer<typeof VOSchema>;

export function assertIsVO(model: unknown, msg?: string): asserts model is VO {
  assertZodPopStack(VOSchema, model, msg);
}

export function parseModel(model: unknown): VO {
  return VOSchema.parse(model);
}