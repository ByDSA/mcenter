import { createManyDataResponseSchema, DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses";
import { genAssertZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
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

  export namespace GetManyByCriteria {
    const bodySchema = EpisodesRestDtos.GetManyByCriteria.criteriaSchema;
    const responseSchema = createManyDataResponseSchema(episodeEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export type Res = z.infer<typeof responseSchema>;
    // eslint-disable-next-line require-await
    export async function fetch(body: Body): Promise<Res> {
      const method = "POST";
      const fetcher = makeFetcher<Body, Res>( {
        method,
        body,
        reqBodyValidator: genAssertZod(bodySchema),
        resBodyValidator: genAssertZod(responseSchema),
      } );
      const URL = backendUrl(
        PATH_ROUTES.episodes.search.path,
      );

      return fetcher( {
        url: URL,
        method,
        body,
      } );
    }
  }
}
