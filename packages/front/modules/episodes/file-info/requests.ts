/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodeFileInfoEntity } from "./models";
import { EpisodeFileInfoCrudDtos } from "./models/dto";

export class EpisodeFileInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async fetch(
    id: EpisodeFileInfoEntity["id"],
    body: EpisodeFileInfoCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: EpisodeFileInfoCrudDtos.Patch.bodySchema,
      responseSchema: EpisodeFileInfoCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.fileInfo.withParams(id),
      ),
      body,
    } );
  }
}
