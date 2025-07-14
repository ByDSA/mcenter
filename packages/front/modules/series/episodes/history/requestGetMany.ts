import { z } from "zod";
import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses/rest";
import { PATH_ROUTES } from "$shared/routing";
import { UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { HistoryEntryEntity, historyEntryEntitySchema } from "./models";
import { historyListRestDto } from "./models/dto";

type Data = Required<HistoryEntryEntity>[];
type HistoryListGetManyEntriesBySuperIdRequest = {
  body: z.infer<typeof historyListRestDto.getManyEntriesBySuperId.reqBodySchema>;
};
const body: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["episodes", "series"],
};
const validator = (res: DataResponse<Data>) => {
  assertIsManyDataResponse(res, historyEntryEntitySchema.required() as any);
};
const method = "POST";
const fetcher = makeFetcher( {
  method,
  body,
  resBodyValidator: validator,
} );

export const useRequest: UseRequest<DataResponse<Data>> = makeUseRequest<HistoryListGetManyEntriesBySuperIdRequest["body"], DataResponse<Data>>( {
  key: {
    url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
    method,
    body,
  },
  fetcher,
  refreshInterval: 5 * 1000,
} );
