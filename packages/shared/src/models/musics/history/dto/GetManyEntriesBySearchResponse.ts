import { z } from "zod";

import { EntrySchema } from "../Entry";

export const GetManyEntriesBySearchResponseSchema = z.array(EntrySchema);

export type GetManyEntriesBySearchResponse = z.infer<typeof GetManyEntriesBySearchResponseSchema>;

export function assertIsGetManyEntriesBySearchResponse(o: unknown): asserts o is GetManyEntriesBySearchResponse {
  GetManyEntriesBySearchResponseSchema.parse(o);
}