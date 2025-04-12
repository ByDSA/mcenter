import { z } from "zod";
import { getOneByIdSchema } from "./GetOneByIdRequest";
import { searchSchema } from "./Criteria";

export const getManyEntriesBySuperIdSchema = getOneByIdSchema.extend( {
  body: searchSchema,
} ).required();

export type GetManyEntriesBySuperIdRequest = z.infer<typeof getManyEntriesBySuperIdSchema>;

export function assertIsGetManyEntriesBySuperIdRequest(
  o: unknown,
): asserts o is GetManyEntriesBySuperIdRequest {
  getManyEntriesBySuperIdSchema.parse(o);
}
