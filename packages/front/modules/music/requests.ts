/* eslint-disable import/prefer-default-export */
import { makeFetcher } from "#modules/fetching";
import { BACKEND_URLS } from "#modules/urls";
import { MusicID, MusicPatchOneByIdReq, MusicPatchOneByIdReqBody, MusicPatchOneByIdResBody, assertIsMusicPatchOneByIdReqBody, assertIsMusicPatchOneByIdResBody } from "#shared/models/musics";

// eslint-disable-next-line require-await
export async function fetchPatch(id: MusicID, body: MusicPatchOneByIdReq["body"]): Promise<MusicPatchOneByIdResBody | undefined> {
  const fetcher = makeFetcher<MusicPatchOneByIdReqBody, MusicPatchOneByIdResBody>( {
    method: "PATCH",
    body,
    reqBodyValidator: assertIsMusicPatchOneByIdReqBody,
    resBodyValidator: assertIsMusicPatchOneByIdResBody,
  } );
  const URL = BACKEND_URLS.resources.musics.crud.patch( {
    id,
  } );

  return fetcher(URL);
}