/* eslint-disable import/no-cycle */
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity, MusicId } from "#musics/models";
import { makeFetcher } from "#modules/fetching/fetcher";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { useMusic } from "./hooks";

export class MusicsApi {
  static {
    FetchApi.register(this, new this());
  }

  async patch(
    id: MusicId,
    body: MusicCrudDtos.Patch.Body,
  ): Promise<MusicCrudDtos.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher( {
      method,
      requestSchema: MusicCrudDtos.Patch.bodySchema,
      responseSchema: MusicCrudDtos.Patch.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.withParams(id)),
      body,
    } );

    if (ret.data)
      useMusic.updateCacheWithMerging(ret.data.id, ret.data);

    return ret;
  }

  async getOneByCriteria(
    { skipCache, ...criteria }: MusicCrudDtos.GetOne.Criteria & {
      skipCache?: boolean;
    },
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicCrudDtos.GetOne.criteriaSchema,
      responseSchema: MusicCrudDtos.GetOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.search.path + "-one"),
      body: criteria,
    } );

    if (ret.data) {
      if (!skipCache)
        useMusic.updateCacheWithMerging(ret.data.id, ret.data);

      if (ret.data?.imageCover)
        useImageCover.updateCache(ret.data.imageCoverId!, ()=>ret.data!.imageCover!);
    }

    return ret;
  }

  async getManyByCriteria(
    criteria: MusicCrudDtos.GetMany.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicCrudDtos.GetMany.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.search.path),
      body: criteria,
    } );

    if (ret.data) {
      for (const m of ret.data) {
        useMusic.updateCacheWithMerging(m.id, m);

        if (m.imageCover)
          useImageCover.updateCache(m.imageCoverId!, ()=>m.imageCover!);
      }
    }

    return ret;
  }

  async deleteOneById(id: MusicEntity["id"]) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: MusicCrudDtos.Delete.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.musics.withParams(id)),
    } );

    await useMusic.invalidateCache(id);

    return ret;
  }
}
