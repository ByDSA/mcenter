/* eslint-disable import/no-cycle */
import assert from "assert";
import { createPaginatedResultResponseSchema } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { makeFetcher } from "#modules/fetching/fetcher";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { uploadFile } from "#modules/utils/upload-files";
import { useMusic } from "#musics/hooks";
import { ImageCoverEntity, imageCoverEntitySchema } from "./models";
import { useImageCover } from "./hooks";

type UpdateImageProps = {
  id: string | null;
  label?: string;
};

export class ImageCoversApi {
  static {
    FetchApi.register(this, new this());
  }

  async patch(
    id: string,
    body: ImageCoverCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: ImageCoverCrudDtos.Patch.bodySchema,
      responseSchema: ImageCoverCrudDtos.Patch.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.imageCovers.withParams(id)),
      body,
    } );

    useImageCover.updateCacheWithMerging(ret.data.id, ret.data);

    return ret;
  }

  async getOneByCriteria(
    { skipCache, ...criteria }: ImageCoverCrudDtos.GetOne.Criteria & {
      skipCache?: boolean;
    },
  ): Promise<ImageCoverCrudDtos.GetOne.Response> {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: ImageCoverCrudDtos.GetOne.criteriaSchema,
      responseSchema: ImageCoverCrudDtos.GetOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.imageCovers.getOne.path),
      body: criteria,
    } );

    if (ret.data && !skipCache)
      useImageCover.updateCacheWithMerging(ret.data.id, ret.data);

    return ret;
  }

  async getManyByCriteria(
    criteria: ImageCoverCrudDtos.GetMany.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: ImageCoverCrudDtos.GetMany.criteriaSchema,
      responseSchema: createPaginatedResultResponseSchema(imageCoverEntitySchema),
    } );
    const URL = backendUrl(PATH_ROUTES.imageCovers.getMany.path);
    const ret = await fetcher( {
      url: URL,
      body: criteria,
    } );

    if (ret.data) {
      for (const im of ret.data)
        useImageCover.updateCacheWithMerging(im.id, im);
    }

    return ret;
  }

  async deleteOneById(id: ImageCoverEntity["id"]) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: ImageCoverCrudDtos.Delete.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.imageCovers.withParams(id)),
    } );

    await useMusic.invalidateCache(id);

    return ret;
  }

  async updateImage(
    file: File,
    options: UpdateImageProps,
  ): Promise<ImageCoverCrudDtos.UploadFile.Response> {
    const URL = backendUrl(PATH_ROUTES.imageCovers.upload.path);
    const metadata: ImageCoverCrudDtos.UploadFile.RequestBody["metadata"] = {};

    if (options.id)
      metadata.imageCoverId = options.id;

    if (options.label)
      metadata.label = options.label;

    assert(
      (metadata.imageCoverId && !metadata.label)
      || (!metadata.imageCoverId && metadata.label),
    );

    const res = await uploadFile<ImageCoverCrudDtos.UploadFile.Response>( {
      url: URL,
      withCredentials: true,
      file,
      metadata,
    } );

    if (res.data.imageCover)
      useImageCover.updateCacheWithMerging(res.data.imageCover.id, res.data.imageCover);

    return res;
  }
}
