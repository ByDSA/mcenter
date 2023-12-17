/* eslint-disable import/no-extraneous-dependencies */
import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { ResourceSchema } from "../resource";
import { LocalFileSchema, PickableSchema, TaggableSchema } from "../resource/PartialSchemas";

// TODO: quitar 'path', 'hash' y 'duration' de aqui y ponerlo en el 'fileInfo'
export const ModelSchema = z.object( {
  artist: z.string().optional(),
  hash: z.string().optional(),
  url: z.string(),
  duration: z.number().optional(),
  size: z.number().optional(),
} )
  .merge(ResourceSchema)
  .merge(PickableSchema)
  .merge(LocalFileSchema)
  .merge(TaggableSchema);

type Model = z.infer<typeof ModelSchema>;
export default Model;

export function assertIsModel(model: unknown, msg?: string): asserts model is Model {
  assertZodPopStack(ModelSchema, model, msg);
}