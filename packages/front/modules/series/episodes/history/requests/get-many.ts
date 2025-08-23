import { createManyResultResponseSchema } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { genAssertZod } from "$shared/utils/validation/zod";
import { episodeEntitySchema } from "$shared/models/episodes";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";
import { episodeHistoryEntryEntitySchema } from "../models";

export const dataSchema = episodeHistoryEntryEntitySchema
  .omit( {
    resource: true,
  } )
  .extend( {
    resource: episodeEntitySchema.required( {
      fileInfos: true,
    } ),
  } );

export type Data = z.infer<typeof dataSchema>;

const resSchema = createManyResultResponseSchema(dataSchema);

export type Res = z.infer<typeof resSchema>;

type Req = EpisodeHistoryEntryCrudDtos.GetManyByCriteria.Criteria;
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
    expand: ["episodes", "series", "episode-file-infos"],
  };
  const fetcher = makeFetcher<Req, Res>( {
    method,
    body,
    resBodyValidator: genAssertZod(resSchema),
  } );

  return fetcher( {
    url: backendUrl(PATH_ROUTES.episodes.history.entries.search.path),
    body,
  } );
};
