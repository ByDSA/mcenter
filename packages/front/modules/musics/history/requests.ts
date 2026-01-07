import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { createManyResultResponseSchema, createOneResultResponseSchema, type ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { musicEntitySchema } from "../models";
import { musicHistoryEntryEntitySchema, type MusicHistoryEntryEntity } from "./models";

export class MusicHistoryApi {
  static {
    FetchApi.register(MusicHistoryApi, new MusicHistoryApi());
  }

  getManyByCriteria(
    props: MusicHistoryApi.GetManyByCriteria.Props,
  ): Promise<MusicHistoryApi.GetManyByCriteria.Response> {
    const body: MusicHistoryApi.GetManyByCriteria.Request = {
      sort: {
        timestamp: "desc",
      },
      limit: props?.limit ?? 10,
      offset: props?.offset ?? undefined,
      expand: ["musics", "musicsFavorite"],
    };
    const fetcher = makeFetcher<
      MusicHistoryApi.GetManyByCriteria.Request,
      MusicHistoryApi.GetManyByCriteria.Response
    >( {
      method: "POST",
      parseResponse: genParseZod(
        MusicHistoryApi.GetManyByCriteria.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.search.path),
      body,
    } );
  }

  deleteOneById(
    id: MusicHistoryEntryEntity["id"],
  ): Promise<MusicHistoryApi.DeleteOneById.Response> {
    const fetcher = makeFetcher<undefined, MusicHistoryApi.DeleteOneById.Response>( {
      method: "DELETE",
      parseResponse: genParseZod(createOneResultResponseSchema(
        musicHistoryEntryEntitySchema,
      )) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.withParams(id)),
      body: undefined,
    } );
  }

  createOne(
    body: MusicHistoryApi.CreateOne.Body,
  ): Promise<MusicHistoryApi.CreateOne.Response> {
    const fetcher = makeFetcher<
      MusicHistoryApi.CreateOne.Body,
      MusicHistoryApi.CreateOne.Response
     >( {
       method: "POST",
       parseResponse: genParseZod(MusicHistoryApi.CreateOne.responseSchema) as (m: unknown)=> any,
     } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.path),
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicHistoryApi {
  export namespace GetManyByCriteria {
    export type Request = MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria;

    export type Props = {
      limit?: number;
      offset?: number;
    };

    export const dataSchema = musicHistoryEntryEntitySchema
      .required( {
        resource: true,
      } )
      .extend( {
        resource: musicEntitySchema.required( {
          userInfo: true,
        } ),
      } );

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createManyResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace DeleteOneById {
    export type Response = ResultResponse<MusicHistoryEntryEntity>;
  }

  export namespace CreateOne {
    export type Body = {
      musicId: string;
      timestamp?: number;
    };

    export const responseSchema = createOneResultResponseSchema(
      musicHistoryEntryEntitySchema,
    );
    export type Response = z.infer<typeof responseSchema>;
  }
}
