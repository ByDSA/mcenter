import { z } from "zod";
import { searchSchema } from "./Criteria";

export const getManyEntriesBySearchSchema = z.object( {
  body: searchSchema,
} ).required();

export type GetManyEntriesBySearchRequest = z.infer<typeof getManyEntriesBySearchSchema>;

export function assertIsGetManyEntriesBySearchRequest(
  o: unknown,
): asserts o is GetManyEntriesBySearchRequest {
  getManyEntriesBySearchSchema.parse(o);
}
