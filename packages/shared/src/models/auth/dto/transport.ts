import z from "zod";
import { createOneResultResponseSchema } from "../../../utils/http/responses";
import { userEntitySchema, userEntityWithRolesSchema } from "../user";

export namespace UserCrudDtos {
  export namespace SetFavoritePlaylist {
    export const dataSchema = userEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;

    export const bodySchema = z.object( {
      playlistId: z.string().nullable(),
    } );

    export type Body = z.infer<typeof bodySchema>;
  }
};

export namespace AuthCrudDtos {
  export namespace LocalLogin {
    export const bodySchema = z.object( {
      usernameOrEmail: z.string().min(1),
      password: z.string().min(1),
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(userEntityWithRolesSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace LocalSignUp {
    export const bodySchema = z.object( {
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email(),
      username: z.string().min(1),
      password: z.string().min(1),
    } );

    export type Body = z.infer<typeof bodySchema>;

    export const responseSchema = createOneResultResponseSchema(userEntityWithRolesSchema);

    export type Response = z.infer<typeof responseSchema>;
  }
}
