/* eslint-disable import/no-extraneous-dependencies */
import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { FileInfoSchema } from "../episodes/fileinfo";
import { ResourceSchema } from "../resource";
import { LocalFileSchema, PickableSchema, TaggableSchema } from "../resource/PartialSchemas";

export const ModelSchema = z.object( {
  artist: z.string(),
  url: z.string(),
  mediaInfo: z.object( {
    duration: z.number().nullable(),
  } ).strict(),
} )
// TODO: quitar esto de aquí y ponerlo en un 'fileInfoAudio'
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