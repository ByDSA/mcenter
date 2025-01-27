import { z } from "zod";

import { searchSchema } from "./Criteria";

export const getManyBySearchSchema = z.object( {
  body: searchSchema,
} ).required();

export type GetManyBySearchRequest = z.infer<typeof getManyBySearchSchema>;

export function assertIsGetManyBySearchRequest(o: unknown): asserts o is GetManyBySearchRequest {
  getManyBySearchSchema.parse(o);
}
