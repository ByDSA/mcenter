import z from "zod";
import { createOneResultResponseSchema } from "../../../../utils/http/responses";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { mongoDbId } from "../../../resources/partial-schemas";
import { musicUserInfoEntitySchema, musicUserInfoSchema } from "../user-info";

export namespace MusicInfoCrudDtos {
  export const keySchema = z.object( {
    musicId: mongoDbId,
    userId: mongoDbId,
  } );
  const responseOneSchema = createOneResultResponseSchema(musicUserInfoEntitySchema);

  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(musicUserInfoSchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const bodySchema = musicUserInfoSchema.omit( {
      createdAt: true,
      updatedAt: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
}
