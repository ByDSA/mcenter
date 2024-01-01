import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { ResourceVOSchema } from "../resource";
import { TimeRangeSchema } from "../resource/PartialSchemas";
import { FileInfoSchemaVideo } from "./fileinfo";

// TODO: quitar 'path' de aqui y ponerlo en el 'fileInfo'
export const VOSchema = ResourceVOSchema
  .merge(TimeRangeSchema)
  .merge(z.object( {
    fileInfo: FileInfoSchemaVideo.optional(),
  } ));

type Model = z.infer<typeof VOSchema>;
export default Model;

export function assertIsModel(model: unknown, msg?: string): asserts model is Model {
  assertZodPopStack(VOSchema, model, msg);
}