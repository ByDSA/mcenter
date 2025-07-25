import { genAssertZod } from "$shared/utils/validation/zod";
import { DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfoRestDtos } from "$shared/models/musics/file-info/dto/transport";
import { MusicId } from "#musics/models";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export namespace MusicFileInfoFetching {
  export namespace Patch {
    export type Response = DataResponse<MusicFileInfoEntity>;
    export type Body = MusicFileInfoRestDtos.PatchOneById.Body;
    // eslint-disable-next-line require-await
    export async function fetch(
      id: MusicId,
      body: Body,
    ): Promise<Response> {
      const method = "PATCH";
      const fetcher = makeFetcher<Body, Response>( {
        method,
        body,
        reqBodyValidator: genAssertZod(MusicFileInfoRestDtos.PatchOneById.bodySchema),
        resBodyValidator: genAssertZod(MusicFileInfoRestDtos.PatchOneById.responseSchema),
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
