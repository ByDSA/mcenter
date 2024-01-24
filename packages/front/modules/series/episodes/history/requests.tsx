/* eslint-disable require-await */
/* eslint-disable import/prefer-default-export */
import { UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { HistoryEntryWithId, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";

const body: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
  "filter": {
  },
  "sort": {
    "timestamp": "desc",
  },
  "limit": 10,
  "expand": ["episodes", "series"],
};
const validator = (data: Required<HistoryEntryWithId>[]) => {
  assertIsHistoryListGetManyEntriesBySearchResponse(data);
};
const method = "POST";
const fetcher = makeFetcher( {
  method,
  body,
  resBodyValidator: validator,
} );

export const backendUrls = {
  entries: {
    crud: {
      search: `${rootBackendUrl}/api/history-list/entries/search`,
    },
  },
  crud: {
    get: `${rootBackendUrl}/api/history-list`,
  },
};

export const useRequest: UseRequest<Required<HistoryEntryWithId>[]> = makeUseRequest<HistoryListGetManyEntriesBySuperIdRequest["body"], Required<HistoryEntryWithId>[]>( {
  key: {
    url: backendUrls.entries.crud.search,
    method,
    body,
  },
  fetcher,
  refreshInterval: 5 * 1000,
} );