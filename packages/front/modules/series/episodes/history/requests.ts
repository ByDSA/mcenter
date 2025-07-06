/* eslint-disable require-await */
import { genAssertZod } from "#shared/utils/validation/zod";
import { z } from "zod";
import { makeFetcher } from "#modules/fetching";
import { HistoryEntryId, HistoryListId } from "./models";
import { deleteOneEntryById } from "./models/dto";
import { backendUrls } from "./requestGetMany";

type HistoryListDeleteOneEntryByIdResBody = z.infer<typeof deleteOneEntryById.resBodySchema>;
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
    resBodyValidator: genAssertZod(deleteOneEntryById.resBodySchema),
    body: undefined,
  } );

  return fetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
