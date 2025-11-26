import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { userEntitySchema } from "$shared/models/auth";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";

export class UsersApi {
  static {
    FetchApi.register(UsersApi, new UsersApi());
  }

  setFavoritePlaylist(
    playlistId: string | null,
  ): Promise<UsersApi.SetFavoritePlaylist.Response> {
    const fetcher = makeFetcher<
      UsersApi.SetFavoritePlaylist.Body,
      UsersApi.SetFavoritePlaylist.Response
    >( {
      method: "PATCH",
      parseResponse: genParseZod(
        UsersApi.SetFavoritePlaylist.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl("/api/users/musics/favorite-playlist"),
      body: {
        playlistId,
      },
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace UsersApi {
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
}
