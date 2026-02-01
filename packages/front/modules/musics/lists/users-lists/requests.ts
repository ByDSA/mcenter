import { MusicUserListsCrudDtos } from "$shared/models/musics/users-lists/dto/transport";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";

export class MusicUsersListsApi {
  static {
    FetchApi.register(MusicUsersListsApi, new MusicUsersListsApi());
  }

  private readonly baseUrl = "/api/musics/users-lists";

  getMyList(
    criteria: MusicUserListsCrudDtos.GetMyList.RequestParams,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicUserListsCrudDtos.GetMyList.bodySchema,
      responseSchema: MusicUserListsCrudDtos.GetMyList.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(this.baseUrl + "/my-lists"),
      body: criteria,
    } );
  }

  patchMyList(
    body: MusicUserListsCrudDtos.PatchMyList.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicUserListsCrudDtos.PatchMyList.bodySchema,
      responseSchema: MusicUserListsCrudDtos.PatchMyList.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(this.baseUrl),
      body,
    } );
  }

  moveOneList(
    body: MusicUserListsCrudDtos.MoveOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicUserListsCrudDtos.MoveOne.bodySchema,
      responseSchema: MusicUserListsCrudDtos.GetMyList.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        `${this.baseUrl}/move`,
      ),
      body,
    } );
  }
}
