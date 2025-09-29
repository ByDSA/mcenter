import { createManyResultResponseSchema } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { StreamCrudDtos } from "$shared/models/streams/dto/transport";
import { streamEntitySchema } from "$shared/models/streams";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export const dataSchema = streamEntitySchema;

export type Data = z.infer<typeof dataSchema>;

const resSchema = createManyResultResponseSchema(dataSchema);

export type Res = z.infer<typeof resSchema>;

const reqSchema = StreamCrudDtos.GetManyByCriteria.criteriaSchema;

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
  const fetcher = makeFetcher<Req, Res>( {
    method,
    reqBodyValidator: genAssertZod(reqSchema),
    parseResponse: genParseZod(resSchema),
  } );

  return fetcher( {
    url: backendUrl(PATH_ROUTES.streams.search.path),
    body,
  } );
};
