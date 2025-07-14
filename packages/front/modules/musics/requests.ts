import z from "zod";
import { musicRestDto } from "$shared/models/musics/dto/transport";
import { genAssertZod } from "$shared/utils/validation/zod";
import { DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity, MusicId } from "#musics/models";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

type PatchOneByIdResBody = DataResponse<MusicEntity>;
type PatchOneByIdReqBody = z.infer<typeof musicRestDto.patchOneById.reqBodySchema>;
type PatchOneByIdReq = {
  body: PatchOneByIdReqBody;
};
// eslint-disable-next-line require-await
export async function fetchPatch(id: MusicId, body: PatchOneByIdReq["body"]): Promise<PatchOneByIdResBody> {
  const method = "PATCH";
  const fetcher = makeFetcher<PatchOneByIdReqBody, PatchOneByIdResBody>( {
    method,
    body,
    reqBodyValidator: genAssertZod(musicRestDto.patchOneById.reqBodySchema),
    resBodyValidator: genAssertZod(z.undefined()),
  } );
  const URL = backendUrl(PATH_ROUTES.musics.withParams(id));

  return fetcher( {
    url: URL,
    method,
    body,
  } );
}
