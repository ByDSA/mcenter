import { z } from "zod";
import { GetOneByIdSchema } from "./GetOneByIdRequest";

import { SearchSchema } from "./Criteria";

export const GetManyEntriesBySuperIdSchema = GetOneByIdSchema.extend( {
  body: SearchSchema,
} ).required();

export type GetManyEntriesBySuperIdRequest = z.infer<typeof GetManyEntriesBySuperIdSchema>;

export function assertIsGetManyEntriesBySuperIdRequest(o: unknown): asserts o is GetManyEntriesBySuperIdRequest {
  GetManyEntriesBySuperIdSchema.parse(o);
}