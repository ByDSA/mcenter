import { MusicHistoryEntryRestDtos } from "$shared/models/musics/history/dto/transport";
import { createManyDataResponseSchema, DataResponse, genAssertIsOneDataResponse } from "$shared/utils/http/responses";
import { musicHistoryEntryEntitySchema, musicHistoryEntrySchema } from "$shared/models/musics/history";
import { PATH_ROUTES } from "$shared/routing";
import { genAssertZod } from "$shared/utils/validation/zod";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher, makeUseRequest } from "#modules/fetching";
import { MusicHistoryEntryEntity } from "#musics/history/models";
import { musicEntitySchema } from "../models";

namespace _GetManyByCriteria {
  export type Req = MusicHistoryEntryRestDtos.GetManyByCriteria.Criteria;
  const body: Req = {
    filter: {},
    sort: {
      timestamp: "desc",
    },
    limit: 10,
    expand: ["musics", "music-file-infos"],
  };

  export const dataSchema = musicHistoryEntryEntitySchema
    .omit( {
      music: true,
    } )
    .extend( {
      music: musicEntitySchema.extend( {
        fileInfos: musicEntitySchema.shape.fileInfos.unwrap(),
      } ),
    } );

  export type Data = z.infer<typeof dataSchema>;

  const resSchema = createManyDataResponseSchema(dataSchema);
  export type Res = z.infer<typeof resSchema>;
  const method = "POST";
  const fetcher = makeFetcher<Req, Res>( {
    method,
    body,
    resBodyValidator: genAssertZod(resSchema),
  } );

  export const useRequest = makeUseRequest<
    Req,
    DataResponse<Data[]>
  >( {
    key:
  {
    url: backendUrl(PATH_ROUTES.musics.history.search.path),
    method,
    body,
  },
    fetcher,
    refreshInterval: 5 * 1000,
  } );
}

namespace _DeleteOneById {
  export type Response = DataResponse<MusicHistoryEntryEntity>;
  export function fetch(
    id: MusicHistoryEntryEntity["id"],
  ): Promise<Response> {
    const method = "DELETE";
    const URL = backendUrl(PATH_ROUTES.musics.history.withParams(id));
    const fetcher = makeFetcher<typeof undefined, Response>( {
      method,
      resBodyValidator: genAssertIsOneDataResponse(musicHistoryEntrySchema),
      body: undefined,
    } );

    return fetcher( {
      url: URL,
      method,
      body: undefined,
    } );
  }
}

export namespace MusicHistoryEntryFetching {
  export import GetManyByCriteria = _GetManyByCriteria;
  export import DeleteOneById = _DeleteOneById;
}
