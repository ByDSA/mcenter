import z from "zod";
import { idParamsSchema } from "../../utils/schemas/requests";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { musicEntitySchema } from "../music";

export namespace MusicRestDtos {
  export namespace GetOneById {
    export const paramsSchema = idParamsSchema;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }
}
