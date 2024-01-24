/* eslint-disable require-await */
/* eslint-disable import/prefer-default-export */
import { makeFetcher } from "#modules/fetching";
import { HistoryEntryId, HistoryListDeleteOneEntryByIdResBody, HistoryListId, assertIsHistoryListDeleteOneEntryByIdResBody } from "#shared/models/historyLists";
import { backendUrls } from "./requestGetMany";

export {
  backendUrls, useRequest,
} from "./requestGetMany";

// eslint-disable-next-line require-await
export async function fetchDelete(listId: HistoryListId, entryId: HistoryEntryId): Promise<HistoryListDeleteOneEntryByIdResBody | undefined> {
  const method = "DELETE";
  const URL = `${backendUrls.crud.get}/${listId}/entries/${entryId}`;
  const fetcher = makeFetcher<typeof undefined, HistoryListDeleteOneEntryByIdResBody>( {
    method,
    resBodyValidator: assertIsHistoryListDeleteOneEntryByIdResBody,
    body: undefined,
  } );

  return fetcher( {
    url:URL,
    method,
    body: undefined,
  } );
}