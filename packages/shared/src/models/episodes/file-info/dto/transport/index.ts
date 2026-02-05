import z from "zod";
import { episodeEntitySchema } from "../../../../episodes/episode";
import { mongoDbId } from "../../../../resources/partial-schemas";
import { generatePatchBodySchema } from "../../../../utils/schemas/patch";
import { episodeFileInfoEntitySchema } from "../../file-info";
import { createOneResultResponseSchema } from "../../../../../utils/http/responses";
import { EpisodeFileInfoDtos } from "../domain";
import { createUploadFileResponseSchema } from "../../../../utils/schemas/files";

export namespace EpisodeFileInfoCrudDtos {
  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(episodeFileInfoEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(EpisodeFileInfoDtos.schemaFullDto);
  }

  export namespace UploadFile {
    const metadataWithId = z.object( {
      episodeId: mongoDbId,
    } ).strict();

    const metadataWithKey = z.object( {
      title: z.string().optional(),
      episodeKey: z.string(),
      seriesKey: z.string(),
    } ).strict();

    export const requestBodySchema = z.object( {
      metadata: z.union([metadataWithId, metadataWithKey]),
    } );

    export type RequestBody = z.infer<typeof requestBodySchema>;

    export const responseSchema = createUploadFileResponseSchema( {
      fileInfo: episodeFileInfoEntitySchema,
      episode: episodeEntitySchema,
    } );

    export type Response = z.infer<typeof responseSchema>;
  }
}
