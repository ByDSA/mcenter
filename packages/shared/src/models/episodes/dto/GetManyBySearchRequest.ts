import { z } from "zod";

import { SearchSchema } from "./Criteria";

export const GetManyBySearchSchema = z.object( {
  body: SearchSchema,
} ).required();

export type GetManyBySearchRequest = z.infer<typeof GetManyBySearchSchema>;

export function assertIsGetManyBySearchRequest(o: unknown): asserts o is GetManyBySearchRequest {
  GetManyBySearchSchema.parse(o);
}