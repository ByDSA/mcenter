/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { EpisodeCompKey } from "./models";
import { EpisodesCrudDtos } from "./models/dto";

export class EpisodesApi {
  static {
    FetchApi.register(this, new this());
  }

  async getManyByCriteria(
    body: EpisodesCrudDtos.GetMany.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: EpisodesCrudDtos.GetMany.criteriaSchema,
      responseSchema: EpisodesCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.getMany.path,
      ),
      body,
    } );
  }

  async patch(
    episodeCompKey: EpisodeCompKey,
    body: EpisodesCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: EpisodesCrudDtos.Patch.bodySchema,
      responseSchema: EpisodesCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.slug.withParams(episodeCompKey.seriesKey, episodeCompKey.episodeKey),
      ),
      body,
    } );
  }

  async deleteOne(episodeCompKey: EpisodeCompKey) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: EpisodesCrudDtos.DeleteOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.slug.withParams(episodeCompKey.seriesKey, episodeCompKey.episodeKey),
      ),
    } );
  }

  async getEpisodesBySeason(seriesId: string) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: EpisodesCrudDtos.GetManyBySeason.responseSchema,
    } );
    const res = await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.seasons.withParams(seriesId)),
    } );

    return res;
  }
}
