import z from "zod";
import { mongoDbId } from "../../../models/resource/partial-schemas";
import { getDateNow } from "../../../utils/time";
import { genAssertZod } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-common";
import { musicIdSchema, MusicId, musicEntitySchema } from "../music";
import { musicSchema } from "../music";

const modelSchema = makeHistoryEntrySchema(musicIdSchema, musicSchema)
  .omit( {
    resource: true,
  } );

  type Model = z.infer<typeof modelSchema>;
const entitySchema = modelSchema.extend( {
  id: mongoDbId,
  music: musicEntitySchema.optional(),
} );

type Entity = z.infer<typeof entitySchema>;

const assertIsModel = genAssertZod(modelSchema);
const assertIsEntity = genAssertZod(entitySchema);

function createByMusicId(musicId: MusicId): Model {
  const newEntry: Model = {
    date: getDateNow(),
    resourceId: musicId,
  };

  return newEntry;
}

type EntryId = string;

export {
  EntryId,
  createByMusicId as createMusicHistoryEntryById,
  assertIsEntity as assertIsMusicHistoryEntryEntity,
  assertIsModel as assertIsMusicHistoryEntry,
  Model as MusicHistoryEntry,
  Entity as MusicHistoryEntryEntity,
  modelSchema as musicHistoryEntrySchema,
  entitySchema as musicHistoryEntryEntitySchema,
};
