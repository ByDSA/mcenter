/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { genParseZod } from "$shared/utils/validation/zod";
import { FetchApi } from "#modules/fetching/fetch-api";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryEntity } from "../models";
import * as _GetMany from "./get-many";
import * as _Delete from "./delete";

export class EpisodeHistoryApi {
  static register() {
    FetchApi.register(this, new this());
  }

  async getMany(props: EpisodeHistoryApi.GetMany.FetchProps): Promise<_GetMany.Res> {
    const body: _GetMany.Req = {
      filter: {},
      sort: {
        timestamp: "desc",
      },
      limit: props?.limit ?? 10,
      offset: props?.offset ?? undefined,
      expand: ["episodes", "episode-series", "episode-file-infos", "episode-user-info"],
    };
    const schema = _GetMany.resSchema;
    const fetcher = makeFetcher<_GetMany.Req, _GetMany.Res>( {
      method: EpisodeHistoryApi.GetMany.method,
      parseResponse: genParseZod(schema) as (m: unknown)=> _GetMany.Res,
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
      body,
    } );
  };

  async delete(
    entryId: EpisodeHistoryEntryEntity["id"],
  ): Promise<_Delete.Response> {
    const URL = backendUrl(PATH_ROUTES.episodes.history.entries.withParams(entryId));
    const fetcher = makeFetcher<typeof undefined, _Delete.Response>( {
      method: _Delete.method,
      parseResponse: genParseZod(_Delete.responseSchema) as (m: unknown)=> any,
    } );

    return fetcher( {
      url: URL,
      body: undefined,
    } );
  }
}

// eslint-disable-next-line no-redeclare
export namespace EpisodeHistoryApi {
  export import GetMany = _GetMany;
  export import Delete = _Delete;
}
