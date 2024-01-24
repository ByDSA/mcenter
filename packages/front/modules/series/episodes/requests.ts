import { makeFetcher } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { EpisodeId, EpisodePatchOneByIdReqBody, EpisodePatchOneByIdRequest, EpisodePatchOneByIdResBody, assertIsEpisodePatchOneByIdReqBody, assertIsEpisodePatchOneByIdResBody } from "#shared/models/episodes";

import { backendUrls as historyBackendUrls } from "./history/requests";
/* eslint-disable import/prefer-default-export */
export const backendUrls = {
  history: historyBackendUrls,
  crud: {
    get: `${rootBackendUrl}/api/episodes`,
    patch: ( {id: {innerId, serieId}}: {id: EpisodeId} )=>`${rootBackendUrl}/api/episodes/${serieId}/${innerId}`,
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
    url:URL,
    method,
    body,
  } );
}