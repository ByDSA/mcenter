/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodeFileInfoEntity } from "./models";
import { EpisodeFileInfoDtos, EpisodeFileInfoCrudDtos } from "./models/dto";

export class EpisodeFileInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async fetch(
    id: EpisodeFileInfoEntity["id"],
    body: EpisodeFileInfosApi.Patch.Body,
  ): Promise<EpisodeFileInfosApi.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher<
      EpisodeFileInfosApi.Patch.Body,
      EpisodeFileInfosApi.Patch.Response
    >( {
      method,
      reqBodyValidator: genAssertZod(EpisodeFileInfoCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        createOneResultResponseSchema(EpisodeFileInfoDtos.schemaFullDto),
      )as (m: unknown)=> any,
    } );
    const URL = backendUrl(
      PATH_ROUTES.episodes.fileInfo.withParams(id),
    );

    return fetcher( {
      url: URL,
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace EpisodeFileInfosApi {
  export namespace Patch {
    export type Body = EpisodeFileInfoCrudDtos.PatchOneById.Body;
    export type Response = ResultResponse<EpisodeFileInfoEntity>;

}
}
