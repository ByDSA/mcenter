import { z } from "zod";

import { searchSchema } from "./Criteria";

export const getManyEntriesBySearchSchema = z.object( {
  body: searchSchema,
} ).required();

export type GetManyRequest = z.infer<typeof getManyEntriesBySearchSchema>;

export function assertIsGetManyRequest(o: unknown): asserts o is GetManyRequest {
  getManyEntriesBySearchSchema.parse(o);
}
