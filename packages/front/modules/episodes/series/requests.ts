import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { SeriesCrudDtos } from "./models/dto";

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

  getManyByCriteria(
    criteria: SeriesCrudDtos.GetMany.Criteria,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: SeriesCrudDtos.GetMany.criteriaSchema,
      responseSchema: SeriesCrudDtos.GetMany.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.getMany.path),
      body: criteria,
    } );
  }

  createOne(
    body: SeriesCrudDtos.CreateOne.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "POST",
      requestSchema: SeriesCrudDtos.CreateOne.bodySchema,
      responseSchema: SeriesCrudDtos.CreateOne.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.path),
      body,
    } );
  }

  patch(
    id: string,
    body: SeriesCrudDtos.Patch.Body,
  ) {
    const fetcher = makeFetcher( {
      method: "PATCH",
      requestSchema: SeriesCrudDtos.Patch.bodySchema,
      responseSchema: SeriesCrudDtos.Patch.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
      body,
    } );
  }

  deleteOneById(id: string) {
    const fetcher = makeFetcher( {
      method: "DELETE",
      responseSchema: SeriesCrudDtos.Delete.responseSchema,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
    } );
  }
}
