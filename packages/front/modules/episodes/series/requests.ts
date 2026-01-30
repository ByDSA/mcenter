import { createOneResultResponseSchema, createPaginatedResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { SeriesCrudDtos } from "./models/dto";
import { SeriesEntity, seriesEntitySchema } from "./models";

export class SeriesApi {
  static {
    FetchApi.register(SeriesApi, new SeriesApi());
  }

  getOneById(id: string): Promise<SeriesApi.ResponseOne> {
    const fetcher = makeFetcher<undefined, SeriesApi.ResponseOne>( {
      method: "GET",
      parseResponse: genParseZod(
        SeriesApi.responseOneSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
      body: undefined,
    } );
  }

  getManyByCriteria(
    criteria: SeriesApi.GetManyByCriteria.Criteria,
  ): Promise<SeriesApi.GetManyByCriteria.Response> {
    const fetcher = makeFetcher<
      SeriesApi.GetManyByCriteria.Criteria,
      SeriesApi.GetManyByCriteria.Response
    >( {
      method: "POST",
      parseResponse: (data: unknown) => data as SeriesApi.GetManyByCriteria.Response,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.getMany.path),
      body: criteria,
    } );
  }

  createOne(
    body: SeriesApi.CreateOne.Body,
  ): Promise<SeriesApi.CreateOne.Response> {
    const fetcher = makeFetcher<
      SeriesApi.CreateOne.Body,
      SeriesApi.CreateOne.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        SeriesApi.CreateOne.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.path),
      body,
    } );
  }

  patch(
    id: string,
    body: SeriesApi.Patch.Body,
  ): Promise<SeriesApi.Patch.Response> {
    const fetcher = makeFetcher<
      SeriesApi.Patch.Body,
      SeriesApi.Patch.Response
    >( {
      method: "PATCH",
      parseResponse: genParseZod(
        SeriesApi.Patch.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
      body,
    } );
  }

  deleteOneById(id: string): Promise<SeriesApi.DeleteOneById.Response> {
    const fetcher = makeFetcher<
      undefined,
      SeriesApi.DeleteOneById.Response
    >( {
      method: "DELETE",
      parseResponse: genParseZod(
        createOneResultResponseSchema(seriesEntitySchema.or(z.null())),
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.series.withParams(id)),
      body: undefined,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace SeriesApi {
  export const responseOneSchema = createOneResultResponseSchema(seriesEntitySchema);
  export type ResponseOne = z.infer<typeof responseOneSchema>;
  export const responseManySchema = createPaginatedResultResponseSchema(seriesEntitySchema);
  export type ResponseMany = z.infer<typeof responseManySchema>;

  export namespace GetManyByCriteria {
    export const { criteriaSchema } = SeriesCrudDtos.GetManyByCriteria;
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = responseManySchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const { bodySchema } = SeriesCrudDtos.CreateOne;
    export type Body = z.infer<typeof bodySchema>;

    export const responseSchema = responseOneSchema;
    export type Response = ResponseOne;
  }

  export namespace Patch {
    export const { bodySchema } = SeriesCrudDtos.PatchOneById;
    export type Body = z.infer<typeof bodySchema>;

    export const responseSchema = responseOneSchema;
    export type Response = ResponseOne;
  }

  export namespace DeleteOneById {
    export type Response = ResultResponse<SeriesEntity | null>;
  }
}
