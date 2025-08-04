import z from "zod";
import { generatePatchBodySchema } from "../../../../utils/schemas/patch";
import { idParamsSchema } from "../../../../utils/schemas/requests/id-params";
import { episodeFileInfoEntitySchema } from "../../file-info";

export namespace EpisodeFileInfoCrudDtos {
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(episodeFileInfoEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }
}
