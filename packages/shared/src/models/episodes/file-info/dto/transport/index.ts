import z from "zod";
import { generatePatchBodySchema } from "../../../../utils/schemas/patch";
import { episodeFileInfoEntitySchema } from "../../file-info";
import { createOneResultResponseSchema } from "../../../../../utils/http/responses";
import { EpisodeFileInfoDtos } from "../domain";

export namespace EpisodeFileInfoCrudDtos {
  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(episodeFileInfoEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(EpisodeFileInfoDtos.schemaFullDto);
  }
}
