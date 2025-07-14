import { z } from "zod";
import { musicHistoryEntryRestDto } from "$shared/models/musics/history/dto/transport";
import { assertIsManyDataResponse, DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses/rest";
import { musicHistoryEntrySchema } from "$shared/models/musics/history";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { MusicHistoryEntry } from "#musics/history/models";

type DeleteOneEntryByIdResBody = DataResponse<MusicHistoryEntry>;
type ReqBody = z.infer<typeof musicHistoryEntryRestDto.getManyEntriesByCriteria.reqBodySchema>;
const body: ReqBody = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["musics"],
};
const searchValidator = (data: DataResponse<Required<MusicHistoryEntry>[]>) => {
  assertIsManyDataResponse(data, musicHistoryEntrySchema.required() as any);
};
const searchMethod = "POST";
const searchFetcher = makeFetcher( {
  method: searchMethod,
  body,
  resBodyValidator: searchValidator,
} );

export const useRequest = makeUseRequest<ReqBody, DataResponse<Required<MusicHistoryEntry>[]>>( {
  key:
  {
    url: backendUrl(PATH_ROUTES.musics.history.search.path),
    method: searchMethod,
    body,
  },
  fetcher: searchFetcher,
  refreshInterval: 5 * 1000,
} );

export function fetchDelete(
  entryId: NonNullable<MusicHistoryEntry["id"]>,
): Promise<DeleteOneEntryByIdResBody | undefined> {
  const method = "DELETE";
  const URL = backendUrl(PATH_ROUTES.musics.history.withParams(entryId));
  const deleteFetcher = makeFetcher<typeof undefined, DeleteOneEntryByIdResBody>( {
    method,
    resBodyValidator: genAssertIsOneDataResponse(musicHistoryEntrySchema),
    body: undefined,
  } );

  console.log(URL);

  return deleteFetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
