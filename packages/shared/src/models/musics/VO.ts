/* eslint-disable import/no-extraneous-dependencies */
import { z } from "zod";
import { AssertZodSettings, assertZodPopStack } from "../../utils/validation/zod";
import { FileInfoSchema } from "../episodes/fileinfo";
import { ResourceVOSchema } from "../resource";
import { LocalFileSchema, PickableSchema, TaggableSchema } from "../resource/PartialSchemas";

const OptionalPropsSchema = z.object( {
  album: z.string().optional(),
  game: z.string().optional(),
  year: z.number().int()
    .optional(),
  country: z.string().optional(),
  todo: z.string().optional(),
} );

export const VOSchema = OptionalPropsSchema.extend( {
  artist: z.string(),
  url: z.string(),
  mediaInfo: z.object( {
    duration: z.number().nullable(),
  } ).strict(),
} )
// TODO: quitar FileInfo de aquí y ponerlo en un 'fileInfoAudio'
  .merge(FileInfoSchema)
  .merge(ResourceVOSchema)
  .merge(PickableSchema)
  .merge(LocalFileSchema)
  .merge(TaggableSchema);

export type VO = z.infer<typeof VOSchema>;

export function assertIsVO(model: unknown, settings?: AssertZodSettings): asserts model is VO {
  assertZodPopStack(VOSchema, model, settings);
}

export function parseModel(model: unknown): VO {
  return VOSchema.parse(model);
}