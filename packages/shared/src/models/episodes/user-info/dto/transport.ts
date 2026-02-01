import z from "zod";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { mongoDbId } from "../../../resources/partial-schemas";
import { episodeUserInfoEntitySchema, episodeUserInfoSchema } from "../user-info";
import { createOneResultResponseSchema } from "../../../../utils/http/responses";

export namespace EpisodeInfoCrudDtos {
  export const keySchema = z.object( {
    episodeId: mongoDbId,
    userId: mongoDbId,
  } );

  const responseOneSchema = createOneResultResponseSchema(episodeUserInfoEntitySchema);

  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(episodeUserInfoSchema.omit( {
      createdAt: true,
      updatedAt: true,
      episodeId: true,
      id: true,
      userId: true,
    } ));
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const bodySchema = episodeUserInfoSchema.omit( {
      createdAt: true,
      updatedAt: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
}
