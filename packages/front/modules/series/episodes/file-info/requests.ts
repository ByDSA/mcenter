import { PATH_ROUTES } from "$shared/routing";
import { DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses";
import { genAssertZod } from "$shared/utils/validation/zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { EpisodeFileInfoEntity } from "./models";
import { EpisodeFileInfoDtos, EpisodeFileInfoRestDtos } from "./models/dto";

export namespace EpisodeFileInfoFetching {
  export namespace Patch {
    export type Body = EpisodeFileInfoRestDtos.PatchOneById.Body;
    export type Response = DataResponse<EpisodeFileInfoEntity>;
  // eslint-disable-next-line require-await
    export async function fetch(
      id: EpisodeFileInfoEntity["id"],
      body: Body,
    ): Promise<Response> {
      const method = "PATCH";
      const fetcher = makeFetcher<Body, Response>( {
        method,
        body,
        reqBodyValidator: genAssertZod(EpisodeFileInfoRestDtos.PatchOneById.bodySchema),
        resBodyValidator: genAssertIsOneDataResponse(EpisodeFileInfoDtos.Entity.schema),
      } );
      const URL = backendUrl(
        PATH_ROUTES.episodes.fileInfo.withParams(id),
      );

      return fetcher( {
        url: URL,
        method,
        body,
      } );
    }
}
}
