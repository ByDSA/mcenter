import { z } from "zod";

import { entryWithIdSchema } from "../HistoryEntry";

export const getManyEntriesBySearchResponseSchema = z.array(entryWithIdSchema);

export type GetManyEntriesBySearchResponse = z.infer<typeof getManyEntriesBySearchResponseSchema>;

export function assertIsGetManyEntriesBySearchResponse(
  o: unknown,
): asserts o is GetManyEntriesBySearchResponse {
  getManyEntriesBySearchResponseSchema.parse(o);
}
