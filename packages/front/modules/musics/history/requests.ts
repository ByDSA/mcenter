import { z } from "zod";
import { assertZod, genAssertZod } from "#shared/utils/validation/zod";
import { assertIsMusicVO } from "#musics/models";
import { Entry } from "#musics/history/models";
import { deleteOneEntryById, getManyEntriesBySearch } from "#musics/history/models/dto";
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";

type DeleteOneEntryByIdResBody = z.infer<typeof deleteOneEntryById.resSchema>;
type ReqBody = z.infer<typeof getManyEntriesBySearch.reqBodySchema>;
const body: ReqBody = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["musics"],
};
const searchValidator = (data: Required<Entry>[]) => {
  assertZod(getManyEntriesBySearch.resSchema, data);

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

export const useRequest = makeUseRequest<ReqBody, Required<Entry>[]>( {
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
  entryId: Entry["id"],
): Promise<DeleteOneEntryByIdResBody | undefined> {
  const method = "DELETE";
  const URL = backendUrls.crud.delete( {
    user: "user",
    id: entryId,
  } );
  const deleteFetcher = makeFetcher<typeof undefined, DeleteOneEntryByIdResBody>( {
    method,
    resBodyValidator: genAssertZod(deleteOneEntryById.resSchema),
    body: undefined,
  } );

  console.log(URL);

  return deleteFetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
