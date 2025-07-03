import { z } from "zod";
import { getDateNow } from "../../../utils/time";
import { genAssertZod } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-general";
import { idSchema, MusicId } from "../Entity";
import { musicVoSchema } from "../VO";

export const entrySchema = makeHistoryEntrySchema(idSchema, musicVoSchema);

export type Entry = z.infer<typeof entrySchema>;

export const assertIsEntry = genAssertZod(entrySchema);

export function createMusicHistoryEntryById(musicId: MusicId): Entry {
  const newEntry: Entry = {
    date: getDateNow(),
    resourceId: musicId,
  };

  return newEntry;
}

export type EntryId = string;
