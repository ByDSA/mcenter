/* eslint-disable require-await */
import { DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses/rest";
import { PATH_ROUTES } from "$shared/routing";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { HistoryEntryEntity, historyEntryEntitySchema, HistoryEntryId, HistoryListId } from "./models";

export {
  useRequest,
} from "./requestGetMany";

export async function fetchDelete(
  listId: HistoryListId,
  entryId: HistoryEntryId,
): Promise<DataResponse<HistoryEntryEntity> | undefined> {
  const method = "DELETE";
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.withParams(listId, entryId));
  const fetcher = makeFetcher<typeof undefined, DataResponse<HistoryEntryEntity>>( {
    method,
    resBodyValidator: genAssertIsOneDataResponse(historyEntryEntitySchema),
    body: undefined,
  } );

  return fetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
