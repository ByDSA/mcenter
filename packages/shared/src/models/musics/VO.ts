import { z } from "zod";
import { assertZodPopStack, AssertZodSettings } from "../../utils/validation/zod";
import { FileInfoSchema } from "../episodes/fileinfo";
import { ResourceVOSchema } from "../resource";
import { localFileSchema, pickableSchema, taggableSchema } from "../resource/PartialSchemas";

const optionalPropsSchema = z.object( {
  album: z.string().optional(),
  game: z.string().optional(),
  year: z.number().int()
    .optional(),
  country: z.string().optional(),
} );

export const musicVoSchema = optionalPropsSchema.extend( {
  artist: z.string(),
  url: z.string(),
  mediaInfo: z.object( {
    duration: z.number().nullable(),
  } ).strict(),
} )
// TODO: quitar FileInfo de aquí y ponerlo en un 'fileInfoAudio'
  .merge(FileInfoSchema)
  .merge(ResourceVOSchema)
  .merge(pickableSchema)
  .merge(localFileSchema)
  .merge(taggableSchema);

export type MusicVO = z.infer<typeof musicVoSchema>;

export function assertIsMusicVO(
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is MusicVO {
  assertZodPopStack(musicVoSchema, model, settings);
}

export function parseModel(model: unknown): MusicVO {
  return musicVoSchema.parse(model);
}
