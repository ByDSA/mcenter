import { z } from "zod";
import { genAssertZod } from "#shared/utils/validation/zod";
import { EpisodeId } from "#modules/series/episodes/models";
import { patchOneById } from "#modules/series/episodes/models/dto";
import { makeFetcher } from "#modules/fetching";
import { rootBackendUrl } from "#modules/requests";
import { backendUrls as historyBackendUrls } from "./history/requests";

type EpisodePatchOneByIdReq = {
  body: z.infer<typeof patchOneById.reqBodySchema>;
};
type EpisodePatchOneByIdResBody = z.infer<typeof patchOneById.resSchema>;
export const backendUrls = {
  history: historyBackendUrls,
  crud: {
    get: `${rootBackendUrl}/api/episodes`,
    patch: ( { id: { innerId, serieId } }: {id: EpisodeId} )=>`${rootBackendUrl}/api/episodes/${serieId}/${innerId}`,
    search: `${rootBackendUrl}/api/episodes/search`,
  },
};

// eslint-disable-next-line require-await
export async function fetchPatch(id: EpisodeId, body: EpisodePatchOneByIdReq["body"]): Promise<EpisodePatchOneByIdResBody | undefined> {
  const method = "PATCH";
  const fetcher = makeFetcher<EpisodePatchOneByIdReq["body"], EpisodePatchOneByIdResBody>( {
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
