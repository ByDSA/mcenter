import z from "zod";
import { createOneResultResponseSchema } from "../../../../utils/http/responses";
import { musicUserListEntitySchema, musicUserListSchema } from "..";

export namespace MusicUserListsCrudDtos {
  export namespace MoveOne {
    export const bodySchema = z.object( {
      entryId: z.string(),
      newIndex: z.number()
        .min(0)
        .int(),
    } );
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace GetMyList {
    export const bodySchema = z.object( {
      expand: z.boolean().optional(),
    } );
    export type RequestParams = z.infer<typeof bodySchema>;
    export const dataSchema = musicUserListEntitySchema;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace PatchMyList {
    // Solo permitimos patchear la propiedad 'list'
    export const bodySchema = musicUserListSchema.pick( {
      list: true,
    } );
    export type Body = z.infer<typeof bodySchema>;

    export const dataSchema = musicUserListEntitySchema;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }
}
