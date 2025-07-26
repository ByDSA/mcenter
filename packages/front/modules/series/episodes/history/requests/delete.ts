/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { createOneDataResponseSchema } from "$shared/utils/http/responses";
import { genAssertZod } from "$shared/utils/validation/zod";
import z from "zod";
import { makeFetcher } from "#modules/fetching";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";

const responseSchema = createOneDataResponseSchema(episodeHistoryEntryEntitySchema);

export type Response = z.infer<typeof responseSchema>;

export async function fetch(
  entryId: EpisodeHistoryEntryEntity["id"],
): Promise<Response> {
  const method = "DELETE";
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.withParams(entryId));
  const fetcher = makeFetcher<typeof undefined, Response>( {
    method,
    resBodyValidator: genAssertZod(responseSchema),
    body: undefined,
  } );

  return fetcher( {
    url: URL,
    method,
    body: undefined,
  } );
}
