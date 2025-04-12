/* eslint-disable require-await */
import { HistoryEntryId, HistoryListDeleteOneEntryByIdResBody, HistoryListId, assertIsHistoryListDeleteOneEntryByIdResBody } from "#shared/models/historyLists";
import { makeFetcher } from "#modules/fetching";
import { backendUrls } from "./requestGetMany";

export {
  backendUrls, useRequest,
} from "./requestGetMany";

export async function fetchDelete(
  listId: HistoryListId,
  entryId: HistoryEntryId,
): Promise<HistoryListDeleteOneEntryByIdResBody | undefined> {
  const method = "DELETE";
  const URL = `${backendUrls.crud.get}/${listId}/entries/${entryId}`;
  const fetcher = makeFetcher<typeof undefined, HistoryListDeleteOneEntryByIdResBody>( {
    method,
    resBodyValidator: assertIsHistoryListDeleteOneEntryByIdResBody,
    body: undefined,
  } );

  return fetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
