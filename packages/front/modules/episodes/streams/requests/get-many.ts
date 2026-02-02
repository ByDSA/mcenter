import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { StreamCrudDtos } from "$shared/models/episodes/streams/dto/transport";
import { streamEntitySchema } from "$shared/models/episodes/streams";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export const dataSchema = streamEntitySchema;

export type Data = z.infer<typeof dataSchema>;

const resSchema = StreamCrudDtos.GetMany.responseSchema;

export type Res = z.infer<typeof resSchema>;

const reqSchema = StreamCrudDtos.GetMany.criteriaSchema;

type Req = z.infer<typeof reqSchema>;

const method = "POST";

type FetchProps = {
  limit?: number;
  offset?: number;
};
export const fetch = (props: FetchProps) => {
  const body: Req = {
    expand: ["series"],
    limit: props.limit,
    offset: props.offset ?? 0,
    sort: {
      lastTimePlayed: "desc",
    },
  };
  const fetcher = makeFetcher( {
    method,
    requestSchema: reqSchema,
    responseSchema: resSchema,
  } );

  return fetcher( {
    url: backendUrl(PATH_ROUTES.streams.getMany.path),
    body,
  } );
};
