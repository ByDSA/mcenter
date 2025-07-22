import { DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses";
import { genAssertZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeCompKey, EpisodeEntity, episodeEntitySchema } from "#modules/series/episodes/models";
import { EpisodesRestDtos } from "#modules/series/episodes/models/dto";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export namespace EpisodeFetching {
  export namespace Patch {
    export type Body = EpisodesRestDtos.PatchOneById.Body;
    export type Res = DataResponse<EpisodeEntity>;
    // eslint-disable-next-line require-await
    export async function fetch(
      episodeCompKey: EpisodeCompKey,
      body: Body,
    ): Promise<Res> {
      const method = "PATCH";
      const fetcher = makeFetcher<Body, Res>( {
        method,
        body,
        reqBodyValidator: genAssertZod(EpisodesRestDtos.PatchOneById.bodySchema),
        resBodyValidator: genAssertIsOneDataResponse(episodeEntitySchema),
      } );
      const URL = backendUrl(
        PATH_ROUTES.episodes.withParams(episodeCompKey.seriesKey, episodeCompKey.episodeKey),
      );

      return fetcher( {
        url: URL,
        method,
        body,
      } );
    }
}
}
