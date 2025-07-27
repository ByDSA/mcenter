import { createManyResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { genAssertZod } from "$shared/utils/validation/zod";
import { episodeEntitySchema } from "$shared/models/episodes";
import { UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryRestDtos } from "../models/dto";
import { episodeHistoryEntryEntitySchema } from "../models";

export const dataSchema = episodeHistoryEntryEntitySchema
  .omit( {
    episode: true,
  } )
  .extend( {
    episode: episodeEntitySchema.required( {
      fileInfos: true,
    } ),
  } );

export type Data = z.infer<typeof dataSchema>;

const resSchema = createManyResultResponseSchema(dataSchema);

export type Res = z.infer<typeof resSchema>;

type Req = EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria;
const body: Req = {
  filter: {},
  sort: {
    timestamp: "desc",
  },
  limit: 10,
  expand: ["episodes", "series", "episode-file-infos"],
};
const method = "POST";
const fetcher = makeFetcher<Req, Res>( {
  method,
  body,
  resBodyValidator: genAssertZod(resSchema),
} );

export const useRequest: UseRequest<ResultResponse<Data[]>> = makeUseRequest<
  EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria,
  ResultResponse<Data[]>
 >( {
   key: {
     url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
     method,
     body,
   },
   fetcher,
   refreshInterval: 5 * 1000,
 } );
