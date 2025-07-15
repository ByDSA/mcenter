import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "./models";
import { EpisodeHistoryEntriesCriteria } from "./models/dto";

type Data = Required<EpisodeHistoryEntryEntity>[];
const body: EpisodeHistoryEntriesCriteria = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["episodes", "series"],
};
const validator = (res: DataResponse<Data>) => {
  assertIsManyDataResponse(res, episodeHistoryEntryEntitySchema.required() as any);
};
const method = "POST";
const fetcher = makeFetcher( {
  method,
  body,
  resBodyValidator: validator,
} );

export const useRequest: UseRequest<DataResponse<Data>> = makeUseRequest<
  EpisodeHistoryEntriesCriteria,
  DataResponse<Data>
 >( {
   key: {
     url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
     method,
     body,
   },
   fetcher,
   refreshInterval: 5 * 1000,
 } );
