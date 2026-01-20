import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { genParseZod } from "$shared/utils/validation/zod";
import z from "zod";
import { MusicUserListsCrudDtos } from "$shared/models/musics/users-lists/dto/transport";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { musicUserListEntitySchema, musicUserListSchema } from "./models";

export class MusicUsersListsApi {
  static {
    FetchApi.register(MusicUsersListsApi, new MusicUsersListsApi());
  }

  private readonly baseUrl = "/api/musics/users-lists";

  getMyList(
    criteria: MusicUsersListsApi.GetMyList.RequestParams,
  ): Promise<MusicUsersListsApi.GetMyList.Response> {
    const fetcher = makeFetcher<
      MusicUsersListsApi.GetMyList.RequestParams,
      MusicUsersListsApi.GetMyList.Response
    >( {
      method: "POST",
      parseResponse: (data: unknown) => data as MusicUsersListsApi.GetMyList.Response,
    } );

    return fetcher( {
      url: backendUrl(this.baseUrl + "/my-lists"),
      body: criteria,
    } );
  }

  patchMyList(
    body: MusicUsersListsApi.PatchMyList.Body,
  ): Promise<MusicUsersListsApi.PatchMyList.Response> {
    const fetcher = makeFetcher<
      MusicUsersListsApi.PatchMyList.Body,
      MusicUsersListsApi.PatchMyList.Response
    >( {
      method: "PATCH",
      parseResponse: genParseZod(
        MusicUsersListsApi.PatchMyList.responseSchema,
      ) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: backendUrl(this.baseUrl),
      body,
    } );
  }

  moveOneList(
    body: MusicUserListsCrudDtos.MoveOne.Body,
  ): Promise<MusicUsersListsApi.GetMyList.Response> {
    const fetcher = makeFetcher<
        MusicUserListsCrudDtos.MoveOne.Body,
        MusicUsersListsApi.GetMyList.Response
      >( {
        method: "PATCH",
        parseResponse: genParseZod(
          MusicUsersListsApi.GetMyList.responseSchema,
        ) as (m: unknown)=> any,
      } );

    return fetcher( {
      url: backendUrl(
        `${this.baseUrl}/move`,
      ),
      body,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace MusicUsersListsApi {

  export namespace GetMyList {
    export const requestParamsSchema = z.object( {
      expand: z.boolean().optional(),
    } );
    export type RequestParams = z.infer<typeof requestParamsSchema>;
    export const dataSchema = musicUserListEntitySchema;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace PatchMyList {
    // Solo permitimos patchear la propiedad 'list'
    export const bodySchema = musicUserListSchema.pick( {
      list: true,
    } );
    export type Body = z.infer<typeof bodySchema>;

    export const dataSchema = musicUserListEntitySchema;
    export const responseSchema = createOneResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }
}
