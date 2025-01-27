import { z } from "zod";
import { AssertZodSettings, assertZodPopStack } from "../../utils/validation/zod";
import { ResourceVOSchema, TimeRangeSchema } from "../resource";
import { FileInfoSchemaVideo } from "./fileinfo";

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
export const voSchema = ResourceVOSchema
  .merge(TimeRangeSchema)
  .merge(z.object( {
    fileInfo: FileInfoSchemaVideo.optional(),
  } ));

export type EpisodeVO = z.infer<typeof voSchema>;

export function assertIsModel(
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is EpisodeVO {
  assertZodPopStack(voSchema, model, settings);
}
