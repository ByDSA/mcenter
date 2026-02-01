import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { type MusicPlaylistEntity } from "./models";
import { MusicPlaylistCrudDtos } from "./models/dto";

type AddOneTrackOptions = {
  unique?: boolean;
};

export class MusicPlaylistsApi {
  static {
    FetchApi.register(MusicPlaylistsApi, new MusicPlaylistsApi());
  }

  getOneByCriteria(
    criteria: MusicPlaylistCrudDtos.GetOne.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.GetOne.criteriaSchema,
      responseSchema: MusicPlaylistCrudDtos.GetOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.path + "/search-one"),
      body: criteria,
    } );
  }

  patchOne(
    playlistId: string,
    props: MusicPlaylistCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicPlaylistCrudDtos.Patch.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.withParams(playlistId)),
      body: props,
    } );
  }

  createOne(
    props: MusicPlaylistCrudDtos.CreateOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.CreateOne.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.CreateOne.responseSchema,
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
  ) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: MusicPlaylistCrudDtos.GetOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.move.withParams(
          playlistId,
          itemId,
          newIndexOneBased,
        ),
      ),
    } );
  }

  addOneTrack(
    playlistId: string,
    musicId: string,
    options?: AddOneTrackOptions,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.AddOneTrack.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.AddOneTrack.responseSchema,
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
  ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      requestSchema: MusicPlaylistCrudDtos.RemoveOneTrack.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.RemoveOneTrack.responseSchema,
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
musicId: string;} ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      requestSchema: MusicPlaylistCrudDtos.RemoveOneTrack.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.RemoveOneTrack.responseSchema,
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
    criteria?: MusicPlaylistCrudDtos.GetMany.Criteria,
  ) {
    const body: MusicPlaylistCrudDtos.GetMany.Criteria = {
      ...criteria,
      sort: {
        updated: "desc",
      },
      limit: criteria?.limit ?? 10,
      offset: criteria?.offset ?? undefined,
      expand: ["ownerUserPublic", "imageCover"],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicPlaylistCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.user.withParams(userId)),
      body,
    } );
  }

  getManyByCriteria(
    criteria?: MusicPlaylistCrudDtos.GetMany.Criteria,
  ) {
    const body: MusicPlaylistCrudDtos.GetMany.Criteria = {
      ...criteria,
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicPlaylistCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.search.path),
      body,
    } );
  }

  deleteOneById(
    id: MusicPlaylistEntity["id"],
  ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: MusicPlaylistCrudDtos.Delete.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.withParams(id)),
    } );
  }
}
