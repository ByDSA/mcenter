import { backendUrls as historyBackendUrls } from "./history/requests";
import { EpisodeId } from "#modules/series/episodes/models";
import { EpisodePatchOneByIdReqBody, EpisodePatchOneByIdRequest, EpisodePatchOneByIdResBody, assertIsEpisodePatchOneByIdReqBody, assertIsEpisodePatchOneByIdResBody } from "#modules/series/episodes/models/transport";
import { makeFetcher } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";

export const backendUrls = {
  history: historyBackendUrls,
  crud: {
    get: `${rootBackendUrl}/api/episodes`,
    patch: ( { id: { innerId, serieId } }: {id: EpisodeId} )=>`${rootBackendUrl}/api/episodes/${serieId}/${innerId}`,
    search: `${rootBackendUrl}/api/episodes/search`,
  },
};

// eslint-disable-next-line require-await
export async function fetchPatch(id: EpisodeId, body: EpisodePatchOneByIdRequest["body"]): Promise<EpisodePatchOneByIdResBody | undefined> {
  const method = "PATCH";
  const fetcher = makeFetcher<EpisodePatchOneByIdReqBody, EpisodePatchOneByIdResBody>( {
    method,
    body,
    reqBodyValidator: assertIsEpisodePatchOneByIdReqBody,
    resBodyValidator: assertIsEpisodePatchOneByIdResBody,
  } );
  const URL = backendUrls.crud.patch( {
    id,
  } );

  return fetcher( {
    url: URL,
    method,
    body,
  } );
}
