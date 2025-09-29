/* eslint-disable require-await */
import { createManyResultResponseSchema, createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { EpisodeCompKey, EpisodeEntity, episodeEntitySchema } from "#modules/series/episodes/models";
import { EpisodesCrudDtos } from "#modules/series/episodes/models/dto";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";

export class EpisodesApi {
  static register() {
    FetchApi.register(this, new this());
  }

  async getManyByCriteria(
    body: EpisodesApi.GetManyByCriteria.Body,
  ): Promise<EpisodesApi.GetManyByCriteria.Res> {
    const method = "POST";
    const fetcher = makeFetcher<
      EpisodesApi.GetManyByCriteria.Body,
      EpisodesApi.GetManyByCriteria.Res
    >( {
      method,
      reqBodyValidator: genAssertZod(EpisodesApi.GetManyByCriteria.bodySchema),
      parseResponse: genParseZod(
        EpisodesApi.GetManyByCriteria.responseSchema,
      )as (m: unknown)=> any,
    } );
    const URL = backendUrl(
      PATH_ROUTES.episodes.search.path,
    );

    return fetcher( {
      url: URL,
      body,
    } );
  }

  async patch(
    episodeCompKey: EpisodeCompKey,
    body: EpisodesApi.Patch.Body,
  ): Promise<EpisodesApi.Patch.Res> {
    const method = "PATCH";
    const fetcher = makeFetcher<EpisodesApi.Patch.Body, EpisodesApi.Patch.Res>( {
      method,
      reqBodyValidator: genAssertZod(EpisodesCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        createOneResultResponseSchema(episodeEntitySchema),
      )as (m: unknown)=> any,
    } );
    const URL = backendUrl(
      PATH_ROUTES.episodes.slug.withParams(episodeCompKey.seriesKey, episodeCompKey.episodeKey),
    );

    return fetcher( {
      url: URL,
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace EpisodesApi {
  export namespace Patch {
    export type Body = EpisodesCrudDtos.PatchOneById.Body;
    export type Res = ResultResponse<EpisodeEntity>;
  }

  export namespace GetManyByCriteria {
    export const bodySchema = EpisodesCrudDtos.GetManyByCriteria.criteriaSchema;
    export const responseSchema = createManyResultResponseSchema(episodeEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export type Res = z.infer<typeof responseSchema>;

  }
}
