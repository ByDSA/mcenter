/* eslint-disable import/prefer-default-export */
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { getBackendUrl } from "#modules/utils";
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
  validator,
} );

export const useRequest = makeUseRequest<Required<HistoryMusicEntry>[]>( {
  url: `${getBackendUrl()}/api/musics/history/user/search`,
  fetcher,
  refreshInterval: 5 * 1000,
} );