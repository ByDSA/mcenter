/* eslint-disable import/no-cycle */
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useImageCover } from "#modules/image-covers/hooks";
import { SeriesCrudDtos } from "./models/dto";
import { useSeries } from "./hooks";
import { SeriesEntity } from "./models";

export class SeriesApi {
  static {
    FetchApi.register(SeriesApi, new SeriesApi());
  }

  getOneById(id: string) {
    const fetcher = makeFetcher( {
      method: "GET",
      responseSchema: SeriesCrudDtos.GetOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
    } );
  }

  async getManyByCriteria(
    criteria: SeriesCrudDtos.GetMany.Criteria & {skipCache?: boolean},
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: SeriesCrudDtos.GetMany.criteriaSchema,
      responseSchema: SeriesCrudDtos.GetMany.responseSchema,
    } );
    const { skipCache, ...actualCriteria } = criteria;
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.getMany.path),
      body: actualCriteria,
    } );

    if (!skipCache) {
      for (const item of ret.data)
        updateCache(item);
    }

    return ret;
  }

  async createOne(
    body: SeriesCrudDtos.CreateOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: SeriesCrudDtos.CreateOne.bodySchema,
      responseSchema: SeriesCrudDtos.CreateOne.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.path),
      body,
    } );
    const newItem = ret.data;

    if (newItem)
      updateCache(newItem);

    return ret;
  }

  async patch(
    id: string,
    body: SeriesCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: SeriesCrudDtos.Patch.bodySchema,
      responseSchema: SeriesCrudDtos.Patch.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
      body,
    } );
    const updatedItem = ret.data;

    if (updatedItem)
      updateCache(updatedItem);

    return ret;
  }

  async deleteOneById(id: string) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: SeriesCrudDtos.Delete.responseSchema,
    } );
    const ret = await fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
    } );

    await useSeries.invalidateCache(id);

    return ret;
  }
}

function updateCache(item: SeriesEntity) {
  useSeries.updateCache(item.id, ()=> item);

  if (item.imageCoverId && item.imageCover)
    useImageCover.updateCache(item.imageCoverId, ()=> item.imageCover!);
}
