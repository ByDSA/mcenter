import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { createManyResultResponseSchema, genAssertIsOneResultResponse, type ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { genAssertZod } from "$shared/utils/validation/zod";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching";
import { musicEntitySchema } from "../models";
import { musicHistoryEntryEntitySchema, type MusicHistoryEntryEntity } from "./models";

namespace _GetManyByCriteria {
  export type Req = MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria;

  export const dataSchema = musicHistoryEntryEntitySchema
    .required( {
      resource: true,
    } )
    .extend( {
      resource: musicEntitySchema.required( {
        fileInfos: true,
      } ),
    } );

  export type Data = z.infer<typeof dataSchema>;

  const resSchema = createManyResultResponseSchema(dataSchema);
  export type Res = z.infer<typeof resSchema>;
  const method = "POST";

  type FetchProps = {
    limit?: number;
    offset?: number;
  };
  export const fetch = (props: FetchProps) => {
    const body: Req = {
      filter: {},
      sort: {
        timestamp: "desc",
      },
      limit: props?.limit ?? 10,
      offset: props?.offset ?? undefined,
      expand: ["musics", "music-file-infos"],
    };
    const fetcher = makeFetcher<Req, Res>( {
      method,
      body,
      resBodyValidator: genAssertZod(resSchema),
    } );

    return fetcher( {
      url: backendUrl(PATH_ROUTES.musics.history.search.path),
      body,
    } );
  };
}

namespace _DeleteOneById {
  export type Response = ResultResponse<MusicHistoryEntryEntity>;
  export function fetch(
    id: MusicHistoryEntryEntity["id"],
  ): Promise<Response> {
    const method = "DELETE";
    const URL = backendUrl(PATH_ROUTES.musics.history.withParams(id));
    const fetcher = makeFetcher<typeof undefined, Response>( {
      method,
      resBodyValidator: genAssertIsOneResultResponse(musicHistoryEntryEntitySchema),
      body: undefined,
    } );

    return fetcher( {
      url: URL,
      body: undefined,
    } );
  }
}

export namespace MusicHistoryEntryFetching {
  export import GetManyByCriteria = _GetManyByCriteria;
  export import DeleteOneById = _DeleteOneById;
}
