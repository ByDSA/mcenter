/* eslint-disable require-await */
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { PATH_ROUTES } from "$shared/routing";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";

export class MusicUserInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async patch(
    musicId: string,
    body: MusicInfoCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicInfoCrudDtos.Patch.bodySchema,
      responseSchema: MusicInfoCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.userInfo.withParams(musicId)),
      body,
    } );
  }
}
