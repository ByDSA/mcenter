import { z } from "zod";
import { GetOneByIdSchema } from "./GetOneByIdRequest";

import { SearchSchema } from "./Criteria";

export const GetManyEntriesBySuperIdSchema = GetOneByIdSchema.extend( {
  body: SearchSchema,
} ).required();

export const GetManyEntriesSchema = z.object( {
  body: SearchSchema,
} ).required();

export type GetManyBySuperIdRequest = z.infer<typeof GetManyEntriesBySuperIdSchema>;

export function assertIsGetManyEntriesBySuperIdRequest(o: unknown): asserts o is GetManyBySuperIdRequest {
  GetManyEntriesBySuperIdSchema.parse(o);
}

export function assertIsGetManyEntriesRequest(o: unknown): asserts o is GetManyBySuperIdRequest {
  GetManyEntriesSchema.parse(o);
}