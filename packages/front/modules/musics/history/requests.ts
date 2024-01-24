/* eslint-disable import/prefer-default-export */
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { HistoryMusicEntry, HistoryMusicListGetManyEntriesBySearchRequest, assertIsHistoryMusicListGetManyEntriesBySearchResponse, assertIsMusicVO } from "#shared/models/musics";

type ReqBody = HistoryMusicListGetManyEntriesBySearchRequest["body"];
const body: ReqBody = {
  "filter": {
  },
  "sort": {
    "timestamp": "desc",
  },
  "limit": 10,
  "expand": ["musics"],
};
const validator = (data: Required<HistoryMusicEntry>[]) => {
  assertIsHistoryMusicListGetManyEntriesBySearchResponse(data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};
const method = "POST";
const fetcher = makeFetcher( {
  method,
  body,
  resBodyValidator: validator,
} );

export const backendUrls = {
  crud: {
    search: ( {user} ) => `${rootBackendUrl}/api/musics/history/${user}/search`,
  },
};

export const useRequest = makeUseRequest<ReqBody, Required<HistoryMusicEntry>[]>( {
  key:
  {
    url: backendUrls.crud.search( {
      user: "user",
    } ),
    method,
    body,
  },
  fetcher,
  refreshInterval: 5 * 1000,
} );
