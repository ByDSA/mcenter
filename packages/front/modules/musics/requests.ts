import { MusicPatchOneByIdReq, MusicPatchOneByIdReqBody, MusicPatchOneByIdResBody, assertIsMusicPatchOneByIdReqBody, assertIsMusicPatchOneByIdResBody } from "#musics/models/transport";
import { MusicId } from "#musics/models";
import { makeFetcher } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { backendUrls as historyBackendUrls } from "./history/requests";

export const backendUrls = {
  crud: {
    patch: ( { id } )=>`${rootBackendUrl}/api/musics/${id}`,
  },
  history: historyBackendUrls,
  raw: ( { url } )=>`${rootBackendUrl}/api/musics/get/raw/${url}`,
};

// eslint-disable-next-line require-await
export async function fetchPatch(id: MusicId, body: MusicPatchOneByIdReq["body"]): Promise<MusicPatchOneByIdResBody> {
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
    url: URL,
    method,
    body,
  } );
}
