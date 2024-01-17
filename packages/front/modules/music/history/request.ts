/* eslint-disable import/prefer-default-export */
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { BACKEND_URLS } from "#modules/urls";
import { HistoryMusicEntry, HistoryMusicListGetManyEntriesBySearchRequest, assertIsHistoryMusicListGetManyEntriesBySearchResponse, assertIsMusicVO } from "#shared/models/musics";

const body: HistoryMusicListGetManyEntriesBySearchRequest["body"] = {
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
const fetcher = makeFetcher( {
  method: "POST",
  body,
  resBodyValidator: validator,
} );

export const useRequest = makeUseRequest<Required<HistoryMusicEntry>[]>( {
  url: BACKEND_URLS.resources.musics.history.crud.search( {
    user: "user",
  } ),
  fetcher,
  refreshInterval: 5 * 1000,
} );