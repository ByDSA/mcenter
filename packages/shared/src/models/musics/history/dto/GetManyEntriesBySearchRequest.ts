import { z } from "zod";
import { searchSchema } from "./Criteria";

export const musicHistoryListGetManyEntriesBySearchSchema = z.object( {
  body: searchSchema,
} ).required();

export type MusicHistoryListGetManyEntriesBySearchRequest
 = z.infer<typeof musicHistoryListGetManyEntriesBySearchSchema>;

export function assertIsMusicHistoryListGetManyEntriesBySearchRequest(
  o: unknown,
): asserts o is MusicHistoryListGetManyEntriesBySearchRequest {
  musicHistoryListGetManyEntriesBySearchSchema.parse(o);
}
