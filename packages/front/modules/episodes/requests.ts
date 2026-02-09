/* eslint-disable import/no-cycle */
import { PATH_ROUTES } from "$shared/routing";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { EpisodeEntity } from "./models";
import { EpisodesCrudDtos } from "./models/dto";
import { useEpisode } from "./hooks";

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
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.getMany.path,
      ),
      body,
    } );

    for (const e of ret.data)
      updateCache(e);

    return ret;
  }

  async getOneById(
    id: string,
    criteria?: Omit<EpisodesCrudDtos.GetOne.Criteria, "filter" | "sort"> & {skipCache?: boolean},
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: EpisodesCrudDtos.GetOne.criteriaSchema,
      responseSchema: EpisodesCrudDtos.GetOne.responseSchema,
    } );
    const { skipCache, ...actualCriteria } = criteria ?? {};
    const body: EpisodesCrudDtos.GetOne.Criteria = {
      ...actualCriteria,
      filter: {
        id,
      },
    };
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.getOne.path,
      ),
      body,
    } );

    if (!skipCache) {
      if (ret.data)
        updateCache(ret.data);
      else
        await useEpisode.invalidateCache(id);
    }

    return ret;
  }

  async patch(
    episodeId: string,
    body: EpisodesCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: EpisodesCrudDtos.Patch.bodySchema,
      responseSchema: EpisodesCrudDtos.Patch.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.withParams(episodeId),
      ),
      body,
    } );

    if (ret.data)
      updateCache(ret.data);

    return ret;
  }

  async deleteOne(id: string) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: EpisodesCrudDtos.DeleteOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.episodes.withParams(id),
      ),
    } );

    await useEpisode.invalidateCache(id);

    return ret;
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

function updateCache(e: EpisodeEntity) {
  useEpisode.updateCacheWithMerging(e.id, e);

  if (e.imageCoverId && e.imageCover)
    useImageCover.updateCacheWithMerging(e.imageCoverId, e.imageCover);
}
