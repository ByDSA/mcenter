import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { useMusic } from "#musics/hooks";
import { type MusicPlaylistEntity } from "./models";
import { MusicPlaylistCrudDtos } from "./models/dto";

type AddOneTrackOptions = {
  allowDuplicates?: boolean;
};

export class MusicPlaylistsApi {
  static {
    FetchApi.register(MusicPlaylistsApi, new MusicPlaylistsApi());
  }

  async getOneByCriteria(
    criteria: MusicPlaylistCrudDtos.GetOne.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.GetOne.criteriaSchema,
      responseSchema: MusicPlaylistCrudDtos.GetOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.getOne.path),
      body: criteria,
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async patchOne(
    playlistId: string,
    props: MusicPlaylistCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicPlaylistCrudDtos.Patch.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.Patch.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.withParams(playlistId)),
      body: props,
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async createOne(
    props: MusicPlaylistCrudDtos.CreateOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.CreateOne.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.CreateOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.path),
      body: props,
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async moveOneTrack(
    playlistId: string,
    itemId: string,
    newIndexOneBased: number,
  ) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: MusicPlaylistCrudDtos.GetOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.move.withParams(
          playlistId,
          itemId,
          newIndexOneBased,
        ),
      ),
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async addOneTrack(
    playlistId: string,
    musicId: string,
    options?: AddOneTrackOptions,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicPlaylistCrudDtos.AddManyTracks.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.AddManyTracks.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.withParams(
          playlistId,
        ),
      ),
      body: {
        musics: [musicId],
        allowDuplicates: options?.allowDuplicates,
      },
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async removeOneTrack(
    { itemId, playlistId }: {
    playlistId: string;
    itemId: string;
  },
  ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      requestSchema: MusicPlaylistCrudDtos.RemoveManyTracks.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.RemoveManyTracks.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.withParams(
          playlistId,
        ),
      ),
      body: {
        tracks: [itemId],
      },
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async removeAllTracksByMusicId( { playlistId,
    musicId }: {playlistId: string;
musicId: string;} ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      requestSchema: MusicPlaylistCrudDtos.RemoveManyTracks.bodySchema,
      responseSchema: MusicPlaylistCrudDtos.RemoveManyTracks.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(
        PATH_ROUTES.musics.playlists.track.withParams(
          playlistId,
        ),
      ),
      body: {
        musicIds: [musicId],
      },
    } );

    if (ret.data)
      updateCachesForOne(ret.data);

    return ret;
  }

  async getManyByUserCriteria(
    userId: string,
    criteria?: MusicPlaylistCrudDtos.GetMany.Criteria,
  ) {
    const body: MusicPlaylistCrudDtos.GetMany.Criteria = {
      ...criteria,
      sort: {
        user: "asc",
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
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.user.withParams(userId)),
      body,
    } );

    updateCachesForMany(ret.data);

    return ret;
  }

  async getManyByCriteria(
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
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.playlists.getMany.path),
      body,
    } );

    updateCachesForMany(ret.data);

    return ret;
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

function updateCachesForMany(data: MusicPlaylistCrudDtos.GetMany.Response["data"]) {
  for (const d of data)
    updateCachesForOne(d);
}
function updateCachesForOne(d: MusicPlaylistCrudDtos.GetMany.Response["data"][0]) {
  if (d.imageCover && d.imageCoverId)
    useImageCover.updateCache(d.imageCoverId, ()=>d.imageCover!);

  for (const entry of d.list) {
    if (entry.music)
      useMusic.updateCache(entry.musicId, ()=>entry.music!);
  }
}
