import { createManyResultResponseSchema, createOneResultResponseSchema, type ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { MusicSmartPlaylistEntity, musicSmartPlaylistEntitySchema } from "./models";
import { MusicSmartPlaylistCrudDtos } from "./models/dto";

export class MusicSmartPlaylistsApi {
  static {
    FetchApi.register(MusicSmartPlaylistsApi, new MusicSmartPlaylistsApi());
  }

  async getOneByCriteria(
    criteria: MusicSmartPlaylistsApi.GetOne.Body,
  ): Promise<MusicSmartPlaylistsApi.GetOne.Response> {
    const fetcher = makeFetcher<
      MusicSmartPlaylistsApi.GetOne.Body,
      MusicSmartPlaylistsApi.GetOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicSmartPlaylistsApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.path + "/search-one"),
      body: criteria,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async createOne(
    props: MusicSmartPlaylistsApi.CreateOne.Body,
  ): Promise<MusicSmartPlaylistsApi.CreateOne.Response> {
    const fetcher = makeFetcher<
      MusicSmartPlaylistsApi.CreateOne.Body,
      MusicSmartPlaylistsApi.CreateOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicSmartPlaylistsApi.CreateOne.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.path),
      body: props,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async patchOne(
    id: string,
    props: MusicSmartPlaylistsApi.PatchOne.Body,
  ): Promise<MusicSmartPlaylistsApi.PatchOne.Response> {
    const fetcher = makeFetcher<
      MusicSmartPlaylistsApi.PatchOne.Body,
      MusicSmartPlaylistsApi.PatchOne.Response
    >( {
      method: "PATCH",
      parseResponse: genParseZod(
        MusicSmartPlaylistsApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.withParams(id)),
      body: props,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async getManyByUserCriteria(
    userId: string,
    criteria?: MusicSmartPlaylistsApi.GetManyByCriteria.Body,
  ): Promise<MusicSmartPlaylistsApi.GetManyByCriteria.Response> {
    const body: MusicSmartPlaylistsApi.GetManyByCriteria.Body = {
      ...criteria,
      sort: {
        updated: "desc",
      },
      limit: criteria?.limit ?? 10,
      offset: criteria?.offset ?? undefined,
      expand: ["imageCover"],
    };
    const fetcher = makeFetcher<
      MusicSmartPlaylistsApi.GetManyByCriteria.Body,
      MusicSmartPlaylistsApi.GetManyByCriteria.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicSmartPlaylistsApi.GetManyByCriteria.responseSchema,
      ) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.path + "/search"),
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
    id: MusicSmartPlaylistEntity["id"],
  ): Promise<MusicSmartPlaylistsApi.DeleteOneById.Response> {
    const fetcher = makeFetcher<undefined, MusicSmartPlaylistsApi.DeleteOneById.Response>( {
      method: "DELETE",
      parseResponse: genParseZod(createOneResultResponseSchema(
        musicSmartPlaylistEntitySchema,
      )) as (m: unknown)=> any,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.withParams(id)),
      body: undefined,
    } );

    await useImageCover.invalidateCache(id);

    return ret;
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicSmartPlaylistsApi {
  export namespace GetOne {
    export const body = MusicSmartPlaylistCrudDtos.GetOne.criteriaSchema;
    export type Body = z.infer<typeof body>;
    export const dataSchema = musicSmartPlaylistEntitySchema;
    export type Data = z.infer<typeof dataSchema>;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const responseSchema = createOneResultResponseSchema(musicSmartPlaylistEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
    export const { bodySchema } = MusicSmartPlaylistCrudDtos.CreateOne;
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace PatchOne {
    export const dataSchema = musicSmartPlaylistEntitySchema;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
    export const { bodySchema } = MusicSmartPlaylistCrudDtos.PatchOneById;
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace GetManyByCriteria {
    export const body = MusicSmartPlaylistCrudDtos.GetMany.criteriaSchema;
    export type Body = z.infer<typeof body>;
    export const dataSchema = musicSmartPlaylistEntitySchema;
    export type Data = z.infer<typeof dataSchema>;
    export const responseSchema = createManyResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace DeleteOneById {
    export type Response = ResultResponse<MusicSmartPlaylistEntity>;
  }
}
