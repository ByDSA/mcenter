import { PATH_ROUTES } from "$shared/routing";
import { UserCrudDtos } from "$shared/models/auth/dto/transport";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";

export class UsersApi {
  static {
    FetchApi.register(UsersApi, new UsersApi());
  }

  setFavoritePlaylist(
    playlistId: string | null,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: UserCrudDtos.SetFavoritePlaylist.bodySchema,
      responseSchema: UserCrudDtos.SetFavoritePlaylist.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.users.favoritePlaylist.path),
      body: {
        playlistId,
      },
    } );
  }
}
