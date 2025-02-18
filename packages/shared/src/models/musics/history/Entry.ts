import { z } from "zod";
import { getDateNow } from "../../../utils/time";
import { assertZodPopStack } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-general";
import { idSchema, MusicId } from "../Entity";
import { musicVoSchema } from "../VO";

export const entrySchema = makeHistoryEntrySchema(idSchema, musicVoSchema);

export type MusicHistoryEntry = z.infer<typeof entrySchema>;

export function assertIsMusicHistoryEntry(model: unknown): asserts model is MusicHistoryEntry {
  assertZodPopStack(entrySchema, model);
}

export function createMusicHistoryEntryById(musicId: MusicId): MusicHistoryEntry {
  const newEntry: MusicHistoryEntry = {
    date: getDateNow(),
    resourceId: musicId,
  };

  return newEntry;
}
