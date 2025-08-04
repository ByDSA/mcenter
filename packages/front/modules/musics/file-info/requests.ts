import type { ResultResponse } from "$shared/utils/http/responses";
import type { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import type { MusicId } from "#musics/models";
import { genAssertZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export namespace MusicFileInfoFetching {
  export namespace Patch {
    export type Response = ResultResponse<MusicFileInfoEntity>;
    export type Body = MusicFileInfoCrudDtos.PatchOneById.Body;
    // eslint-disable-next-line require-await
    export async function fetch(
      id: MusicId,
      body: Body,
    ): Promise<Response> {
      const method = "PATCH";
      const fetcher = makeFetcher<Body, Response>( {
        method,
        body,
        reqBodyValidator: genAssertZod(MusicFileInfoCrudDtos.PatchOneById.bodySchema),
        resBodyValidator: genAssertZod(MusicFileInfoCrudDtos.PatchOneById.responseSchema),
      } );
      const URL = backendUrl(PATH_ROUTES.musics.withParams(id));

      return fetcher( {
        url: URL,
        method,
        body,
      } );
    }
}
}
