/* eslint-disable no-restricted-imports */
/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { FetchApi } from "#modules/fetching/fetch-api";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { useEpisode } from "#modules/episodes/hooks";
import { useImageCover } from "#modules/image-covers/hooks";
import { useSeries } from "#modules/episodes/series/hooks";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";
import { EpisodeHistoryEntryEntity } from "../models";

type GetManyProps = {
  limit?: number;
  offset?: number;
};

export class EpisodeHistoryApi {
  static {
    FetchApi.register(this, new this());
  }

  async getMany(props: GetManyProps) {
    const body: EpisodeHistoryEntryCrudDtos.GetMany.Criteria = {
      filter: {},
      sort: {
        timestamp: "desc",
      },
      limit: props?.limit ?? 10,
      offset: props?.offset ?? undefined,
      expand: ["episodes", "episodesSeries", "episodesFileInfos", "episodesUserInfo"],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: EpisodeHistoryEntryCrudDtos.GetMany.criteriaSchema,
      responseSchema: EpisodeHistoryEntryCrudDtos.GetMany.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.history.entries.getMany.path),
      body,
    } );

    for (const entry of ret.data)
      updateCache(entry);

    return ret;
  };

  async delete(
    entryId: EpisodeHistoryEntryEntity["id"],
  ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: EpisodeHistoryEntryCrudDtos.DeleteOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.history.entries.withParams(entryId)),
      body: undefined,
    } );
  }

  async getLatestViews(seriesKey: string, episodeKey: string, maxTimestamp: number) {
    const body: EpisodeHistoryEntryCrudDtos.GetMany.Criteria = {
      filter: {
        seriesKey: seriesKey,
        episodeKey: episodeKey,
        timestampMax: maxTimestamp - 1,
      },
      sort: {
        timestamp: "desc",
      },
      limit: 4,
      expand: ["episodes", "episodesSeries", "episodesFileInfos", "episodesUserInfo"],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: EpisodeHistoryEntryCrudDtos.GetMany.criteriaSchema,
      responseSchema: EpisodeHistoryEntryCrudDtos.GetMany.responseSchema,
    } );
    const ret = await fetcher( {
      body,
      url: backendUrl(PATH_ROUTES.episodes.history.entries.getMany.path),
    } );

    for (const entry of ret.data)
      updateCache(entry);

    return ret;
  }
}

function updateCache(entry: EpisodeHistoryEntryEntity) {
  if (entry.resource) {
    const e = entry.resource;

    useEpisode.updateCacheWithMerging(e.id, e);

    if (e.imageCoverId && e.imageCover)
      useImageCover.updateCacheWithMerging(e.imageCoverId, e.imageCover);

    if (entry.resource?.serie)
      useSeries.updateCacheWithMerging(entry.resource.serie.id, entry.resource.serie);
  }
}
