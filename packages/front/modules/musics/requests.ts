import { genAssertZod } from "#shared/utils/validation/zod";
import z from "zod";
import { patchOneById } from "#musics/models/dto";
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

type PatchOneByIdResBody = z.infer<typeof patchOneById.resSchema>;
type PatchOneByIdReqBody = z.infer<typeof patchOneById.reqBodySchema>;
type PatchOneByIdReq = {
  body: PatchOneByIdReqBody;
};
// eslint-disable-next-line require-await
export async function fetchPatch(id: MusicId, body: PatchOneByIdReq["body"]): Promise<PatchOneByIdResBody> {
  const method = "PATCH";
  const fetcher = makeFetcher<PatchOneByIdReqBody, PatchOneByIdResBody>( {
    method,
    body,
    reqBodyValidator: genAssertZod(patchOneById.reqBodySchema),
    resBodyValidator: genAssertZod(patchOneById.resSchema),
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
