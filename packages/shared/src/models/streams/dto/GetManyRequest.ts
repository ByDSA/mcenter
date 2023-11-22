import { z } from "zod";

import { SearchSchema } from "./Criteria";

export const GetManyEntriesBySearchSchema = z.object( {
  body: SearchSchema,
} ).required();

export type GetManyRequest = z.infer<typeof GetManyEntriesBySearchSchema>;

export function assertIsGetManyRequest(o: unknown): asserts o is GetManyRequest {
  GetManyEntriesBySearchSchema.parse(o);
}