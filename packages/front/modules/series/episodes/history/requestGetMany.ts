import { z } from "zod";
import { assertZod } from "#shared/utils/validation/zod";
import { UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { HistoryEntryWithId } from "./models";
import { getManyEntriesBySuperId, getManyEntriesBySearch } from "./models/dto";

type HistoryListGetManyEntriesBySuperIdRequest = {
  body: z.infer<typeof getManyEntriesBySuperId.reqBodySchema>;
};
const body: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["episodes", "series"],
};
const validator = (data: Required<HistoryEntryWithId>[]) => {
  assertZod(getManyEntriesBySearch.resSchema, data);
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
