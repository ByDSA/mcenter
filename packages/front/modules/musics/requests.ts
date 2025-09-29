/* eslint-disable require-await */
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { createOneResultResponseSchema, createPaginatedResultResponseSchema, PaginatedResult, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { MusicEntity, musicEntitySchema, MusicId } from "#musics/models";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";

export class MusicsApi {
  static register() {
    FetchApi.register(this, new this());
  }

  async patch(
    id: MusicId,
    body: MusicsApi.Patch.Body,
  ): Promise<MusicsApi.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher<MusicsApi.Patch.Body, MusicsApi.Patch.Response>( {
      method,
      reqBodyValidator: genAssertZod(MusicCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        createOneResultResponseSchema(musicEntitySchema),
      ) as (m: unknown)=> MusicsApi.Patch.Response,
    } );
    const URL = backendUrl(PATH_ROUTES.musics.withParams(id));

    return fetcher( {
      url: URL,
      body,
    } );
  }

  async getManyByCriteria(
    criteria: MusicsApi.GetManyByCriteria.Criteria,
  ): Promise<MusicsApi.GetManyByCriteria.Response> {
    const method = "POST";
    const fetcher = makeFetcher<
      MusicsApi.GetManyByCriteria.Criteria,
      MusicsApi.GetManyByCriteria.Response
    >( {
      method,
      reqBodyValidator: genAssertZod(MusicCrudDtos.GetMany.criteriaSchema),
      parseResponse: genParseZod(
        createPaginatedResultResponseSchema(musicEntitySchema),
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.musics.search.path);

    return fetcher( {
      url: URL,
      body: criteria,
    } );
  }

  async deleteOneById(id: MusicEntity["id"]): Promise<MusicsApi.DeleteOneById.Response> {
    const method = "DELETE";
    const fetcher = makeFetcher<
      undefined,
      MusicsApi.DeleteOneById.Response
    >( {
      method,
      parseResponse: genParseZod(
        createOneResultResponseSchema(musicEntitySchema.or(z.null())),
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.musics.withParams(id));

    return fetcher( {
      url: URL,
      body: undefined,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicsApi {
  export namespace Patch {
    export type Response = ResultResponse<MusicEntity>;
    export type Body = MusicCrudDtos.PatchOneById.Body;
  }
  export namespace DeleteOneById {
    export type Response = ResultResponse<MusicEntity>;
  }
  export namespace GetManyByCriteria {
    export type Response = PaginatedResult<MusicEntity>;
    export type Criteria = MusicCrudDtos.GetMany.Criteria;
    export type Body = Criteria;
  }
}
