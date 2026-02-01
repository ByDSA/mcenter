/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { FetchApi } from "#modules/fetching/fetch-api";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryEntity } from "../models";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";

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

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
      body,
    } );
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
      expand: ["episodes"],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: EpisodeHistoryEntryCrudDtos.GetMany.criteriaSchema,
      responseSchema: EpisodeHistoryEntryCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      body,
      url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
    } );
  }
}
