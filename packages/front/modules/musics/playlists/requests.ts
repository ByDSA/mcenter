import { createManyResultResponseSchema, createOneResultResponseSchema, type ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { musicPlaylistEntitySchema, type MusicPlaylistEntity } from "./models";
import { MusicPlaylistCrudDtos } from "./models/dto";

export class MusicPlaylistsApi {
  static register() {
    FetchApi.register(MusicPlaylistsApi, new MusicPlaylistsApi());
  }

  getOneByUserAndSlug(
    userId: string,
    slug: string,
  ): Promise<MusicPlaylistsApi.GetOne.Response> {
    const fetcher = makeFetcher<
      undefined,
      MusicPlaylistsApi.GetOne.Response
    >( {
      method: "GET",
      parseResponse: genParseZod(
        MusicPlaylistsApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.slug.withParams(userId, slug)),
      body: undefined,
    } );
  }

  moveOneTrack(
    playlistId: string,
    itemId: string,
    newIndexOneBased: number,
  ): Promise<MusicPlaylistsApi.GetOne.Response> {
    const fetcher = makeFetcher<
      undefined,
      MusicPlaylistsApi.GetOne.Response
    >( {
      method: "GET",
      parseResponse: genParseZod(
        MusicPlaylistsApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.move.withParams(
          playlistId,
          itemId,
          newIndexOneBased,
        ),
      ),
      body: undefined,
    } );
  }

  getManyByUserCriteria(
    userId: string,
    criteria?: MusicPlaylistsApi.GetManyByCriteria.RequestBody,
  ): Promise<MusicPlaylistsApi.GetManyByCriteria.Response> {
    const body: MusicPlaylistsApi.GetManyByCriteria.RequestBody = {
      ...criteria,
      sort: {
        updated: "desc",
      },
      limit: criteria?.limit ?? 10,
      offset: criteria?.offset ?? undefined,
      expand: ["musics"],
    };
    const fetcher = makeFetcher<
      MusicPlaylistsApi.GetManyByCriteria.RequestBody,
      MusicPlaylistsApi.GetManyByCriteria.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicPlaylistsApi.GetManyByCriteria.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.user.withParams(userId)),
      body,
    } );
  }

  getManyByCriteria(
    criteria?: MusicPlaylistsApi.GetManyByCriteria.RequestBody,
  ): Promise<MusicPlaylistsApi.GetManyByCriteria.Response> {
    const body: MusicPlaylistsApi.GetManyByCriteria.RequestBody = {
      ...criteria,
    };
    const fetcher = makeFetcher<
      MusicPlaylistsApi.GetManyByCriteria.RequestBody,
      MusicPlaylistsApi.GetManyByCriteria.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicPlaylistsApi.GetManyByCriteria.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.path),
      body,
    } );
  }

  deleteOneById(
    id: MusicPlaylistEntity["id"],
  ): Promise<MusicPlaylistsApi.DeleteOneById.Response> {
    const fetcher = makeFetcher<undefined, MusicPlaylistsApi.DeleteOneById.Response>( {
      method: "DELETE",
      parseResponse: genParseZod(createOneResultResponseSchema(
        musicPlaylistEntitySchema,
      )) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.withParams(id)),
      body: undefined,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicPlaylistsApi {
  export namespace GetOne {
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetManyByCriteria {
    export type RequestBody = MusicPlaylistCrudDtos.GetMany.Criteria;

    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createManyResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace DeleteOneById {
    export type Response = ResultResponse<MusicPlaylistEntity>;
  }
}
