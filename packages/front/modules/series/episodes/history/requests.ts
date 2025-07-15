/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema, EpisodeHistoryEntryId } from "./models";

export {
  useRequest,
} from "./requestGetMany";

export async function fetchDelete(
  entryId: EpisodeHistoryEntryId,
): Promise<DataResponse<EpisodeHistoryEntryEntity> | undefined> {
  const method = "DELETE";
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.withParams(entryId));
  const fetcher = makeFetcher<typeof undefined, DataResponse<EpisodeHistoryEntryEntity>>( {
    method,
    resBodyValidator: genAssertIsOneDataResponse(episodeHistoryEntryEntitySchema),
    body: undefined,
  } );

  return fetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
