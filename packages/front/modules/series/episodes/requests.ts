import { z } from "zod";
import { DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses";
import { genAssertZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeEntity, episodeEntitySchema, EpisodeId } from "#modules/series/episodes/models";
import { patchOneById } from "#modules/series/episodes/models/dto";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

type EpisodePatchOneByIdReq = {
  body: z.infer<typeof patchOneById.reqBodySchema>;
};

// eslint-disable-next-line require-await
export async function fetchPatch(id: EpisodeId, body: EpisodePatchOneByIdReq["body"]): Promise<DataResponse<EpisodeEntity> | undefined> {
  const method = "PATCH";
  const fetcher = makeFetcher<EpisodePatchOneByIdReq["body"], DataResponse<EpisodeEntity>>( {
    method,
    body,
    reqBodyValidator: genAssertZod(patchOneById.reqBodySchema),
    resBodyValidator: genAssertIsOneDataResponse(episodeEntitySchema),
  } );
  const URL = backendUrl(
    PATH_ROUTES.episodes.withParams(id.serieId, id.code),
  );

  return fetcher( {
    url: URL,
    method,
    body,
  } );
}
