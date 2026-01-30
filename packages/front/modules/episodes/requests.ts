/* eslint-disable require-await */
import { createManyResultResponseSchema, createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodeCompKey, EpisodeEntity, episodeEntitySchema, EpisodesBySeason, episodesBySeasonSchema } from "./models";
import { EpisodesCrudDtos } from "./models/dto";

export class EpisodesApi {
  static {
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

  async deleteOne(episodeCompKey: EpisodeCompKey): Promise<EpisodesApi.DeleteOne.Res> {
    const method = "DELETE";
    const fetcher = makeFetcher<undefined, EpisodesApi.DeleteOne.Res>( {
      method,
      parseResponse: genParseZod(
        createOneResultResponseSchema(episodeEntitySchema.or(z.null())),
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(
      PATH_ROUTES.episodes.slug.withParams(episodeCompKey.seriesKey, episodeCompKey.episodeKey),
    );

    return fetcher( {
      url: URL,
      body: undefined,
    } );
  }

  async getEpisodesBySeason(seriesId: string): Promise<ResultResponse<EpisodesBySeason>> {
    const fetcher = makeFetcher<undefined, {data: EpisodesBySeason}>( {
      method: "GET",
      parseResponse: genParseZod(
        createOneResultResponseSchema(episodesBySeasonSchema),
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.episodes.series.seasons.withParams(seriesId));
    const res = await fetcher( {
      url: URL,
      body: undefined,
    } );

    return res;
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

  export namespace DeleteOne {
    export type Res = ResultResponse<EpisodeEntity | null>;
  }
}
