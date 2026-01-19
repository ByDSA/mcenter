/* eslint-disable import/no-cycle */
import assert from "assert";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { createOneResultResponseSchema, createPaginatedResultResponseSchema, PaginatedResult, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
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
    body: ImageCoversApi.Patch.Body,
  ): Promise<ImageCoversApi.Patch.Response> {
    const method = "PATCH";
    const fetcher = makeFetcher<ImageCoversApi.Patch.Body, ImageCoversApi.Patch.Response>( {
      method,
      reqBodyValidator: genAssertZod(ImageCoverCrudDtos.PatchOneById.bodySchema),
      parseResponse: genParseZod(
        createOneResultResponseSchema(imageCoverEntitySchema),
      ) as (m: unknown)=> ImageCoversApi.Patch.Response,
    } );
    const URL = backendUrl(PATH_ROUTES.imageCovers.withParams(id));
    const ret = await fetcher( {
      url: URL,
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
    const method = "POST";
    const fetcher = makeFetcher<
      ImageCoverCrudDtos.GetOne.Criteria,
      ImageCoverCrudDtos.GetOne.Response
    >( {
      method,
      reqBodyValidator: genAssertZod(ImageCoverCrudDtos.GetOne.criteriaSchema),
      parseResponse: genParseZod(
        ImageCoverCrudDtos.GetOne.responseSchema,
      ) as (m: unknown)=> ImageCoverCrudDtos.GetOne.Response,
    } );
    const URL = backendUrl(PATH_ROUTES.imageCovers.path + "/search-one");
    const ret = await fetcher( {
      url: URL,
      body: criteria,
    } );

    if (ret.data && !skipCache)
      useImageCover.updateCacheWithMerging(ret.data.id, ret.data);

    return ret;
  }

  async getManyByCriteria(
    criteria: ImageCoversApi.GetManyByCriteria.Criteria,
  ): Promise<ImageCoversApi.GetManyByCriteria.Response> {
    const method = "POST";
    const fetcher = makeFetcher<
      ImageCoversApi.GetManyByCriteria.Criteria,
      ImageCoversApi.GetManyByCriteria.Response
    >( {
      method,
      reqBodyValidator: genAssertZod(ImageCoverCrudDtos.GetMany.criteriaSchema),
      parseResponse: genParseZod(
        createPaginatedResultResponseSchema(imageCoverEntitySchema),
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.imageCovers.path + "/search-many");
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

  async deleteOneById(id: ImageCoverEntity["id"]): Promise<ImageCoversApi.DeleteOneById.Response> {
    const method = "DELETE";
    const fetcher = makeFetcher<
      undefined,
      ImageCoversApi.DeleteOneById.Response
    >( {
      method,
      parseResponse: genParseZod(
        createOneResultResponseSchema(imageCoverEntitySchema.or(z.null())),
      ) as (m: unknown)=> any,
    } );
    const URL = backendUrl(PATH_ROUTES.imageCovers.withParams(id));
    const ret = await fetcher( {
      url: URL,
      body: undefined,
    } );

    await useMusic.invalidateCache(id);

    return ret;
  }

  async updateImage(
    file: File,
    options: UpdateImageProps,
  ): Promise<ImageCoverCrudDtos.UploadFile.Response> {
    const URL = backendUrl(PATH_ROUTES.imageCovers.path + "/image");
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

// eslint-disable-next-line no-redeclare
export namespace ImageCoversApi {
  export namespace Patch {
    export type Response = ResultResponse<ImageCoverEntity>;
    export type Body = ImageCoverCrudDtos.PatchOneById.Body;
  }
  export namespace DeleteOneById {
    export type Response = ResultResponse<ImageCoverEntity>;
  }
  export namespace GetManyByCriteria {
    export type Response = PaginatedResult<ImageCoverEntity>;
    export type Criteria = ImageCoverCrudDtos.GetMany.Criteria;
    export type Body = Criteria;
  }
}
