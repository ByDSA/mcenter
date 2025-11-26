/* eslint-disable require-await */
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { createOneResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { MusicUserInfoEntity, musicUserInfoEntitySchema } from "#musics/models";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";

export class MusicUserInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async patch(
    musicId: string,
    body: MusicUserInfosApi.Patch.Body,
  ): Promise<MusicUserInfosApi.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher<MusicUserInfosApi.Patch.Body, MusicUserInfosApi.Patch.Response>( {
      method,
      reqBodyValidator: genAssertZod(MusicInfoCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        createOneResultResponseSchema(musicUserInfoEntitySchema),
      ) as (m: unknown)=> MusicUserInfosApi.Patch.Response,
    } );
    const URL = backendUrl(PATH_ROUTES.musics.userInfo.withParams(musicId));

    return fetcher( {
      url: URL,
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicUserInfosApi {
  export namespace Patch {
    export type Response = ResultResponse<MusicUserInfoEntity>;
    export type Body = MusicInfoCrudDtos.PatchOneById.Body;
  }
}
