/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodeEntity, EpisodeUserInfoEntity, episodeUserInfoEntitySchema } from "../models";
import { EpisodeInfoCrudDtos } from "./dto";

export class EpisodeUserInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async fetch(
    episodeId: EpisodeEntity["id"],
    body: EpisodeUserInfosApi.Patch.Body,
  ): Promise<EpisodeUserInfosApi.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher<
      EpisodeUserInfosApi.Patch.Body,
      EpisodeUserInfosApi.Patch.Response
    >( {
      method,
      reqBodyValidator: genAssertZod(EpisodeInfoCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        createOneResultResponseSchema(episodeUserInfoEntitySchema),
      )as (m: unknown)=> any,
    } );
    const URL = backendUrl(
      PATH_ROUTES.episodes.userInfo.withParams(episodeId),
    );

    return fetcher( {
      url: URL,
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace EpisodeUserInfosApi {
  export namespace Patch {
    export type Body = EpisodeInfoCrudDtos.PatchOneById.Body;
    export type Response = ResultResponse<EpisodeUserInfoEntity>;
}
}
