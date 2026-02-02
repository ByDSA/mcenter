import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { MusicSmartPlaylistEntity } from "./models";
import { MusicSmartPlaylistCrudDtos } from "./models/dto";

export class MusicSmartPlaylistsApi {
  static {
    FetchApi.register(MusicSmartPlaylistsApi, new MusicSmartPlaylistsApi());
  }

  async getOneByCriteria(
    criteria: MusicSmartPlaylistCrudDtos.GetOne.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicSmartPlaylistCrudDtos.GetOne.criteriaSchema,
      responseSchema: MusicSmartPlaylistCrudDtos.GetOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.getOne.path),
      body: criteria,
    } );

    if (ret.data?.imageCover)
      useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);

    return ret;
  }

  async createOne(
    props: MusicSmartPlaylistCrudDtos.CreateOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicSmartPlaylistCrudDtos.CreateOne.bodySchema,
      responseSchema: MusicSmartPlaylistCrudDtos.CreateOne.responseSchema,
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
    props: MusicSmartPlaylistCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicSmartPlaylistCrudDtos.Patch.bodySchema,
      responseSchema: MusicSmartPlaylistCrudDtos.GetOne.responseSchema,
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
    criteria?: MusicSmartPlaylistCrudDtos.GetMany.Criteria,
  ) {
    const body: MusicSmartPlaylistCrudDtos.GetMany.Criteria = {
      ...criteria,
      sort: {
        updated: "desc",
      },
      limit: criteria?.limit ?? 10,
      offset: criteria?.offset ?? undefined,
      expand: ["imageCover"],
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicSmartPlaylistCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicSmartPlaylistCrudDtos.GetMany.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.getMany.path),
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
  ) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: MusicSmartPlaylistCrudDtos.Delete.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.smartPlaylists.withParams(id)),
    } );

    await useImageCover.invalidateCache(id);

    return ret;
  }
}
