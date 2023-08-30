import { ModelFullIdSchema as EpisodeFullIdSchema } from "#modules/episodes/models";
import { DateTypeSchema } from "#utils/time";
import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";

export const EntrySchema = EpisodeFullIdSchema.extend( {
  date: DateTypeSchema,
} ).strict();

type Entry = z.infer<typeof EntrySchema>;
export default Entry;

export function assertIsEntry(model: unknown): asserts model is Entry {
  assertZodPopStack(EntrySchema, model);
}