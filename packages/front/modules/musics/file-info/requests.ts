/* eslint-disable require-await */
import type { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import type { MusicId } from "#musics/models";
import { PATH_ROUTES } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import z from "zod";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";

export class MusicFileInfosApi {
  static {
    FetchApi.register(this, new this());
  }

  async patch(
    id: MusicFileInfoEntity["id"],
    body: MusicFileInfoCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: MusicFileInfoCrudDtos.Patch.bodySchema,
      responseSchema: MusicFileInfoCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.fileInfo.withParams(id)),
      body,
    } );
  }

  async deleteOneById(
    id: MusicFileInfoEntity["id"],
  ): Promise<void> {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: z.undefined(),
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.fileInfo.withParams(id)),
    } );
  }

  async getAllByMusicId(
    id: MusicId,
  ) {
    const body: MusicFileInfoCrudDtos.GetMany.Criteria = {
      filter: {
        musicId: id,
      },
    };
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: MusicFileInfoCrudDtos.GetMany.criteriaSchema,
      responseSchema: MusicFileInfoCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.fileInfo.getMany.path),
      body,
    } );
  }
}
