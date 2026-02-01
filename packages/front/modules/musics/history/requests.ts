import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { type MusicHistoryEntryEntity } from "./models";

type GetManyProps = {
  limit?: number;
  offset?: number;
};

export class MusicHistoryApi {
  static {
    FetchApi.register(MusicHistoryApi, new MusicHistoryApi());
  }

  getManyByCriteria(
    props: GetManyProps,
  ) {
    const body: MusicHistoryEntryCrudDtos.GetMany.Criteria = {
      sort: {
        timestamp: "desc",
      },
      limit: props?.limit ?? 10,
      offset: props?.offset ?? undefined,
      expand: ["musics", "musicsFavorite", "musicsImageCover"],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicHistoryEntryCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicHistoryEntryCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.search.path),
      body,
    } );
  }

  deleteOneById(
    id: MusicHistoryEntryEntity["id"],
  ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: MusicHistoryEntryCrudDtos.Delete.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.withParams(id)),
    } );
  }

  createOne(
    body: MusicHistoryEntryCrudDtos.CreateOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicHistoryEntryCrudDtos.CreateOne.bodySchema,
      responseSchema: MusicHistoryEntryCrudDtos.CreateOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.path),
      body,
    } );
  }

  getLatestsViews(musicId: string, maxTimestamp: number) {
    const body: MusicHistoryEntryCrudDtos.GetMany.Criteria = {
      filter: {
        resourceId: musicId,
        timestampMax: maxTimestamp - 1,
      },
      sort: {
        timestamp: "desc",
      },
      limit: 4,
      expand: [],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicHistoryEntryCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicHistoryEntryCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      body,
      url: backendUrl(PATH_ROUTES.musics.history.search.path),
    } );
  }
}
