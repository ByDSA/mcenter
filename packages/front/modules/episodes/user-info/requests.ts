/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodeEntity } from "../models";
import { EpisodeInfoCrudDtos } from "./dto";

export class EpisodeUserInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async fetch(
    episodeId: EpisodeEntity["id"],
    body: EpisodeInfoCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: EpisodeInfoCrudDtos.Patch.bodySchema,
      responseSchema: EpisodeInfoCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.userInfo.withParams(episodeId),
      ),
      body,
    } );
  }
}
