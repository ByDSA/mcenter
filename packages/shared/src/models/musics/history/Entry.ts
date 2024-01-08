import { z } from "zod";
import { getDateNow } from "../../../utils/time";
import { assertZodPopStack } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-general";
import { IDSchema, Id } from "../Entity";

export const EntrySchema = makeHistoryEntrySchema(IDSchema);

type Entry = z.infer<typeof EntrySchema>;
export default Entry;

export function assertIsEntry(model: unknown): asserts model is Entry {
  assertZodPopStack(EntrySchema, model);
}

export function createById(musicId: Id): Entry {
  const newEntry: Entry = {
    date: getDateNow(),
    resourceId: musicId,
  };

  return newEntry;
}