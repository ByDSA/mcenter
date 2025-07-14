import z from "zod";
import { getDateNow } from "../../../utils/time";
import { genAssertZod } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-common";
import { musicIdSchema, MusicId, musicEntitySchema } from "../music";
import { musicSchema } from "../music";

export const musicHistoryEntrySchema = makeHistoryEntrySchema(musicIdSchema, musicSchema)
  .omit( {
    resource: true,
  } )
  .extend( {
    resource: musicEntitySchema.optional(),
  } );

export type MusicHistoryEntry = z.infer<typeof musicHistoryEntrySchema>;

export const assertIsMusicHistoryEntry = genAssertZod(musicHistoryEntrySchema);

export function createMusicHistoryEntryById(musicId: MusicId): MusicHistoryEntry {
  const newEntry: MusicHistoryEntry = {
    date: getDateNow(),
    resourceId: musicId,
  };

  return newEntry;
}

export type EntryId = string;
