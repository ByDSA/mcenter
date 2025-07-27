import { createManyResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import z from "zod";
import { genAssertZod } from "$shared/utils/validation/zod";
import { StreamRestDtos } from "$shared/models/streams/dto/transport";
import { streamEntitySchema } from "$shared/models/streams";
import { UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { backendUrl } from "#modules/requests";

export const dataSchema = streamEntitySchema;

export type Data = z.infer<typeof dataSchema>;

const resSchema = createManyResultResponseSchema(dataSchema);

export type Res = z.infer<typeof resSchema>;

const reqSchema = StreamRestDtos.GetManyByCriteria.criteriaSchema;

type Req = z.infer<typeof reqSchema>;
const body: Req = {
  expand: ["series"],
  sort: {
    lastTimePlayed: "desc",
  },
};
const method = "POST";
const fetcher = makeFetcher<Req, Res>( {
  method,
  body,
  reqBodyValidator: genAssertZod(reqSchema),
  resBodyValidator: genAssertZod(resSchema),
} );

export const useRequest: UseRequest<ResultResponse<Data[]>> = makeUseRequest<
  StreamRestDtos.GetManyByCriteria.Criteria,
  ResultResponse<Data[]>
 >( {
   key: {
     url: backendUrl(PATH_ROUTES.streams.search.path),
     method,
     body,
   },
   fetcher,
   refreshInterval: 5 * 1000,
 } );
