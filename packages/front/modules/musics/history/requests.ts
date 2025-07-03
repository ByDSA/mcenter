import { assertIsMusicVO } from "#musics/models";
import { MusicHistoryEntry } from "#musics/history/models";
import { MusicHistoryListGetManyEntriesBySearchRequest, assertIsMusicHistoryListGetManyEntriesBySearchResponse, DeleteOneEntryByIdResBody, assertIsDeleteOneEntryByIdResBody, EntryWithId } from "#musics/history/models/transport";
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
const searchValidator = (data: Required<MusicHistoryEntry>[]) => {
  assertIsMusicHistoryListGetManyEntriesBySearchResponse(data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};
const searchMethod = "POST";
const searchFetcher = makeFetcher( {
  method: searchMethod,
  body,
  resBodyValidator: searchValidator,
} );

export const backendUrls = {
  crud: {
    search: ( { user } ) => `${rootBackendUrl}/api/musics/history/${user}/search`,
    delete: ( { user, id } ) => `${rootBackendUrl}/api/musics/history/${user}/${id}`,
  },
};

export const useRequest = makeUseRequest<ReqBody, Required<MusicHistoryEntry>[]>( {
  key:
  {
    url: backendUrls.crud.search( {
      user: "user",
    } ),
    method: searchMethod,
    body,
  },
  fetcher: searchFetcher,
  refreshInterval: 5 * 1000,
} );

export function fetchDelete(
  entryId: EntryWithId["id"],
): Promise<DeleteOneEntryByIdResBody | undefined> {
  const method = "DELETE";
  const URL = backendUrls.crud.delete( {
    user: "user",
    id: entryId,
  } );
  const deleteFetcher = makeFetcher<typeof undefined, DeleteOneEntryByIdResBody>( {
    method,
    resBodyValidator: assertIsDeleteOneEntryByIdResBody,
    body: undefined,
  } );

  console.log(URL);

  return deleteFetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
