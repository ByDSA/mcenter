import z from "zod";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { mongoDbId } from "../../../resources/partial-schemas";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { musicUserInfoSchema } from "../user-info";

export namespace MusicInfoCrudDtos {
  export const keySchema = z.object( {
    musicId: mongoDbId,
    userId: mongoDbId,
  } );

  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicUserInfoSchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
    export type Params = z.infer<typeof paramsSchema>;
  }

  export namespace CreateOne {
    export const bodySchema = musicUserInfoSchema.omit( {
      createdAt: true,
      updatedAt: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
  }
}
