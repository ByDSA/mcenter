import z from "zod";
import { createOneDataResponseSchema } from "../../../../utils/http";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { musicFileInfoEntitySchema } from "../file-info";

export namespace MusicFileInfoRestDtos {
  export namespace GetOneById {
    export const paramsSchema = idParamsSchema;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicFileInfoEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
    export const responseSchema = createOneDataResponseSchema(musicFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }
}
