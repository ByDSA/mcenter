import z from "zod";
import { createOneResultResponseSchema } from "../../../../utils/http/responses";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { musicFileInfoEntitySchema } from "../file-info";

export namespace MusicFileInfoCrudDtos {
  export namespace GetOneById {
    export const paramsSchema = idParamsSchema;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicFileInfoEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
    export const responseSchema = createOneResultResponseSchema(musicFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }
}
