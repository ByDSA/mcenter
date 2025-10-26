import z from "zod";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { mongoDbId } from "../../../resources/partial-schemas";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { episodeUserInfoSchema } from "../user-info";

export namespace EpisodeInfoCrudDtos {
  export const keySchema = z.object( {
    episodeId: mongoDbId,
    userId: mongoDbId,
  } );

  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(episodeUserInfoSchema.omit( {
      createdAt: true,
      updatedAt: true,
      episodeId: true,
      id: true,
      userId: true,
    } ));
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema; // episodeId
    export type Params = z.infer<typeof paramsSchema>;
  }

  export namespace CreateOne {
    export const bodySchema = episodeUserInfoSchema.omit( {
      createdAt: true,
      updatedAt: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
  }
}
