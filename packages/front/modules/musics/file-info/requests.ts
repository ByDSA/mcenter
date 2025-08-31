/* eslint-disable require-await */
import type { ResultResponse } from "$shared/utils/http/responses";
import type { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import type { MusicId } from "#musics/models";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import z from "zod";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";

export class MusicFileInfosApi {
  static register() {
    FetchApi.register(this, new this());
  }

  async patch(
    id: MusicFileInfoEntity["id"],
    body: MusicFileInfosApi.Patch.Body,
  ): Promise<MusicFileInfosApi.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher<
      MusicFileInfosApi.Patch.Body,
      MusicFileInfosApi.Patch.Response
    >( {
      method,
      body,
      reqBodyValidator: genAssertZod(MusicFileInfoCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        MusicFileInfoCrudDtos.PatchOneById.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.musics.fileInfo.withParams(id));

    return fetcher( {
      url: URL,
      body,
    } );
  }

  async deleteOneById(
    id: MusicFileInfoEntity["id"],
  ): Promise<void> {
    const body = undefined;
    const method = "DELETE";
    const fetcher = makeFetcher<
      undefined,
      undefined
    >( {
      method,
      body,
      parseResponse: genParseZod(z.undefined()),
    } );
    const URL = backendUrl(PATH_ROUTES.musics.fileInfo.withParams(id));

    return fetcher( {
      url: URL,
      body,
    } );
  }

  async getAllByMusicId(
    id: MusicId,
  ): Promise<MusicFileInfosApi.GetMany.Response> {
    const method = "POST";
    const body: MusicFileInfosApi.GetMany.Body = {
      filter: {
        musicId: id,
      },
    };
    const fetcher = makeFetcher<
      MusicFileInfosApi.GetMany.Body,
      MusicFileInfosApi.GetMany.Response
    >( {
      method,
      body,
      reqBodyValidator: genAssertZod(MusicFileInfoCrudDtos.GetMany.criteriaSchema),
      parseResponse: genParseZod(
        MusicFileInfoCrudDtos.GetMany.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.musics.fileInfo.path);

    return fetcher( {
      url: URL,
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicFileInfosApi {
  export namespace Patch {
    export type Response = ResultResponse<MusicFileInfoEntity>;
    export type Body = MusicFileInfoCrudDtos.PatchOneById.Body;
  }
  export namespace GetMany {
    export type Response = ResultResponse<MusicFileInfoEntity[]>;
    export type Body = MusicFileInfoCrudDtos.GetMany.Criteria;
  }
}
