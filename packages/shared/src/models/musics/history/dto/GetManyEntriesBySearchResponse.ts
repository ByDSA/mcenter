import { z } from "zod";
import { entrySchema } from "../Entry";

export const musicHistoryListGetManyEntriesBySearchResponseSchema = z.array(entrySchema);

export type MusicHistoryListGetManyEntriesBySearchResponse
= z.infer<typeof musicHistoryListGetManyEntriesBySearchResponseSchema>;

export function assertIsMusicHistoryListGetManyEntriesBySearchResponse(
  o: unknown,
): asserts o is MusicHistoryListGetManyEntriesBySearchResponse {
  musicHistoryListGetManyEntriesBySearchResponseSchema.parse(o);
}
