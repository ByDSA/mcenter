import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { genAssertZod } from "$shared/utils/validation/zod";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity, musicEntitySchema, MusicId } from "#musics/models";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export namespace MusicFetching {
  export namespace Patch {
    export type Response = ResultResponse<MusicEntity>;
    export type Body = MusicCrudDtos.PatchOneById.Body;
    // eslint-disable-next-line require-await
    export async function fetch(
      id: MusicId,
      body: Body,
    ): Promise<Response> {
      const method = "PATCH";
      const fetcher = makeFetcher<Body, Response>( {
        method,
        body,
        reqBodyValidator: genAssertZod(MusicCrudDtos.PatchOneById.bodySchema),
        resBodyValidator: genAssertZod(createOneResultResponseSchema(musicEntitySchema)),
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
