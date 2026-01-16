import { createManyResultResponseSchema, createOneResultResponseSchema, type ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { MusicQueryEntity, musicQueryEntitySchema } from "./models";
import { MusicQueryCrudDtos } from "./models/dto";

export class MusicQueriesApi {
  static {
    FetchApi.register(MusicQueriesApi, new MusicQueriesApi());
  }

  async getOneByCriteria(
    criteria: MusicQueriesApi.GetOne.Body,
  ): Promise<MusicQueriesApi.GetOne.Response> {
    const fetcher = makeFetcher<
      MusicQueriesApi.GetOne.Body,
      MusicQueriesApi.GetOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicQueriesApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.queries.path + "/search-one"),
      body: criteria,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async createOne(
    props: MusicQueriesApi.CreateOne.Body,
  ): Promise<MusicQueriesApi.CreateOne.Response> {
    const fetcher = makeFetcher<
      MusicQueriesApi.CreateOne.Body,
      MusicQueriesApi.CreateOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicQueriesApi.CreateOne.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.queries.path),
      body: props,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async patchOne(
    id: string,
    props: MusicQueriesApi.PatchOne.Body,
  ): Promise<MusicQueriesApi.PatchOne.Response> {
    const fetcher = makeFetcher<
      MusicQueriesApi.PatchOne.Body,
      MusicQueriesApi.PatchOne.Response
    >( {
      method: "PATCH",
      parseResponse: genParseZod(
        MusicQueriesApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.queries.withParams(id)),
      body: props,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async getManyByUserCriteria(
    userId: string,
    criteria?: MusicQueriesApi.GetManyByCriteria.Body,
  ): Promise<MusicQueriesApi.GetManyByCriteria.Response> {
    const body: MusicQueriesApi.GetManyByCriteria.Body = {
      ...criteria,
      sort: {
        updated: "desc",
      },
      limit: criteria?.limit ?? 10,
      offset: criteria?.offset ?? undefined,
      expand: ["imageCover"],
    };
    const fetcher = makeFetcher<
      MusicQueriesApi.GetManyByCriteria.Body,
      MusicQueriesApi.GetManyByCriteria.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicQueriesApi.GetManyByCriteria.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.queries.path + "/search"),
      body: {
        ...body,
        filter: {
          ...body.filter,
          ownerUserId: userId,
        },
      },
    } );

    if (ret.data) {
      for (const q of ret.data)
        useImageCover.updateCache(q.imageCoverId!, ()=>q.imageCover!);
    }

    return ret;
  }

  async deleteOneById(
    id: MusicQueryEntity["id"],
  ): Promise<MusicQueriesApi.DeleteOneById.Response> {
    const fetcher = makeFetcher<undefined, MusicQueriesApi.DeleteOneById.Response>( {
      method: "DELETE",
      parseResponse: genParseZod(createOneResultResponseSchema(
        musicQueryEntitySchema,
      )) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.queries.withParams(id)),
      body: undefined,
    } );

    await useImageCover.invalidateCache(id);

    return ret;
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicQueriesApi {
  export namespace GetOne {
    export const body = MusicQueryCrudDtos.GetOne.criteriaSchema;
    export type Body = z.infer<typeof body>;
    export const dataSchema = musicQueryEntitySchema;
    export type Data = z.infer<typeof dataSchema>;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const responseSchema = createOneResultResponseSchema(musicQueryEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
    export const { bodySchema } = MusicQueryCrudDtos.CreateOne;
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace PatchOne {
    export const dataSchema = musicQueryEntitySchema;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
    export const bodySchema = musicQueryEntitySchema.pick( {
      name: true,
      query: true,
      slug: true,
      visibility: true,
      imageCoverId: true,
    } ).partial();
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace GetManyByCriteria {
    export const body = MusicQueryCrudDtos.GetMany.criteriaSchema;
    export type Body = z.infer<typeof body>;
    export const dataSchema = musicQueryEntitySchema;
    export type Data = z.infer<typeof dataSchema>;
    export const responseSchema = createManyResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace DeleteOneById {
    export type Response = ResultResponse<MusicQueryEntity>;
  }
}
