/* eslint-disable import/prefer-default-export */
import { makeFetcher } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { MusicID, MusicPatchOneByIdReq, MusicPatchOneByIdReqBody, MusicPatchOneByIdResBody, assertIsMusicPatchOneByIdReqBody, assertIsMusicPatchOneByIdResBody } from "#shared/models/musics";
import { historyBackendUrls } from "./history";

export const backendUrls = {
  crud: {
    patch: ( {id} )=>`${rootBackendUrl}/api/musics/${id}`,
  },
  history: historyBackendUrls,
  raw: ( {url} )=>`${rootBackendUrl}/api/musics/get/raw/${url}`,
};

// eslint-disable-next-line require-await
export async function fetchPatch(id: MusicID, body: MusicPatchOneByIdReq["body"]): Promise<MusicPatchOneByIdResBody | undefined> {
  const method = "PATCH";
  const fetcher = makeFetcher<MusicPatchOneByIdReqBody, MusicPatchOneByIdResBody>( {
    method,
    body,
    reqBodyValidator: assertIsMusicPatchOneByIdReqBody,
    resBodyValidator: assertIsMusicPatchOneByIdResBody,
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