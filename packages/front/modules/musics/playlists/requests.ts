import { createManyResultResponseSchema, createOneResultResponseSchema, type ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { musicPlaylistEntitySchema, type MusicPlaylistEntity } from "./models";
import { MusicPlaylistCrudDtos } from "./models/dto";

type AddOneTrackOptions = {
  unique?: boolean;
};

export class MusicPlaylistsApi {
  static {
    FetchApi.register(MusicPlaylistsApi, new MusicPlaylistsApi());
  }

  getOneByCriteria(
    criteria: MusicPlaylistsApi.GetOne.Body,
  ): Promise<MusicPlaylistsApi.GetOne.Response> {
    const fetcher = makeFetcher<
      MusicPlaylistsApi.GetOne.Body,
      MusicPlaylistsApi.GetOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicPlaylistsApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.path + "/search-one"),
      body: criteria,
    } );
  }

  patchOne(
    playlistId: string,
    props: MusicPlaylistsApi.PatchOne.Body,
  ): Promise<MusicPlaylistsApi.PatchOne.Response> {
    const fetcher = makeFetcher<
      MusicPlaylistsApi.PatchOne.Body,
      MusicPlaylistsApi.PatchOne.Response
    >( {
      method: "PATCH",
      parseResponse: genParseZod(
        MusicPlaylistsApi.GetOne.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.withParams(playlistId)),
      body: props,
    } );
  }

  createOne(
    props: MusicPlaylistsApi.CreateOne.Body,
  ): Promise<MusicPlaylistsApi.CreateOne.Response> {
    const fetcher = makeFetcher<
      MusicPlaylistsApi.CreateOne.Body,
      MusicPlaylistsApi.CreateOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicPlaylistsApi.CreateOne.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.path),
      body: props,
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

  addOneTrack(
    playlistId: string,
    musicId: string,
    options?: AddOneTrackOptions,
  ): Promise<MusicPlaylistsApi.AddOneTrack.Response> {
    const fetcher = makeFetcher<
      MusicPlaylistsApi.AddOneTrack.Body,
      MusicPlaylistsApi.AddOneTrack.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicPlaylistsApi.AddOneTrack.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.withParams(
          playlistId,
        ),
      ),
      body: {
        musics: [musicId],
        unique: options?.unique,
      },
    } );
  }

  removeOneTrack(
    { itemId, playlistId }: {
    playlistId: string;
    itemId: string;
  },
  ): Promise<MusicPlaylistsApi.RemoveOneTrack.Response> {
    const fetcher = makeFetcher<
      MusicPlaylistsApi.RemoveOneTrack.Body,
      MusicPlaylistsApi.RemoveOneTrack.Response
    >( {
      method: "DELETE",
      parseResponse: genParseZod(
        MusicPlaylistsApi.RemoveOneTrack.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.withParams(
          playlistId,
        ),
      ),
      body: {
        tracks: [itemId],
      },
    } );
  }

  removeAllTracksByMusicId( { playlistId,
    musicId }: {playlistId: string;
musicId: string;} ): Promise<MusicPlaylistsApi.RemoveOneTrack.Response> {
    const fetcher = makeFetcher<
      MusicPlaylistsApi.RemoveOneTrack.Body,
      MusicPlaylistsApi.RemoveOneTrack.Response
    >( {
      method: "DELETE",
      parseResponse: genParseZod(
        MusicPlaylistsApi.RemoveOneTrack.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.withParams(
          playlistId,
        ),
      ),
      body: {
        musicIds: [musicId],
      },
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
      expand: ["ownerUserPublic", "imageCover"],
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
      url: backendUrl(PATH_ROUTES.musics.playlists.search.path),
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
      url: backendUrl(PATH_ROUTES.musics.playlists.withParams(id)),
      body: undefined,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicPlaylistsApi {
  export namespace GetOne {
    export const body = MusicPlaylistCrudDtos.GetOne.criteriaSchema;
    export type Body = z.infer<typeof body>;
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace PatchOne {
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;

    export const bodySchema = musicPlaylistEntitySchema.pick( {
      name: true,
      slug: true,
    } ).partial();

    export type Body = z.infer<typeof bodySchema>;
  }
  export namespace CreateOne {
    export const responseSchema = createOneResultResponseSchema(musicPlaylistEntitySchema);
    export type Response = z.infer<typeof responseSchema>;

    export const { bodySchema } = MusicPlaylistCrudDtos.CreateOne;

    export type Body = z.infer<typeof bodySchema>;
  }
  export namespace AddOneTrack {
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;

    export const bodySchema = z.object( {
      musics: z.array(mongoDbId),
      unique: z.boolean().optional(),
    } );

    export type Body = z.infer<typeof bodySchema>;
  }
  export namespace RemoveOneTrack {
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
    export const bodySchema = z.union([
      z.object( {
        tracks: z.array(mongoDbId),
        musicIds: z.never().optional(),
      } ),
      z.object( {
        musicIds: z.array(mongoDbId),
        tracks: z.never().optional(),
      } ),
    ]);

    export type Body = z.infer<typeof bodySchema>;
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
