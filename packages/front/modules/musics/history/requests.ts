import { assertIsMusicVO } from "#musics/models";
import { MusicHistoryEntry } from "#musics/history/models";
import { MusicHistoryListGetManyEntriesBySearchRequest, assertIsMusicHistoryListGetManyEntriesBySearchResponse } from "#musics/history/models/transport";
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";

type ReqBody = MusicHistoryListGetManyEntriesBySearchRequest["body"];
const body: ReqBody = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["musics"],
};
const validator = (data: Required<MusicHistoryEntry>[]) => {
  assertIsMusicHistoryListGetManyEntriesBySearchResponse(data);

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
    search: ( { user } ) => `${rootBackendUrl}/api/musics/history/${user}/search`,
  },
};

export const useRequest = makeUseRequest<ReqBody, Required<MusicHistoryEntry>[]>( {
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
