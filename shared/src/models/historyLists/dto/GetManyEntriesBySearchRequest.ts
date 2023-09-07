import { z } from "zod";

import { SearchSchema } from "./Criteria";

export const GetManyEntriesBySearchSchema = z.object( {
  body: SearchSchema,
} ).required();

export type GetManyEntriesBySearchRequest = z.infer<typeof GetManyEntriesBySearchSchema>;

export function assertIsGetManyEntriesBySearchRequest(o: unknown): asserts o is GetManyEntriesBySearchRequest {
  GetManyEntriesBySearchSchema.parse(o);
}