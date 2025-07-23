import z from "zod";
import { mongoDbId } from "../../../models/resource/partial-schemas";
import { genAssertZod } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-common";
import { musicIdSchema, musicEntitySchema } from "../music";
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

type EntryId = string;

export {
  EntryId,
  assertIsEntity as assertIsMusicHistoryEntryEntity,
  assertIsModel as assertIsMusicHistoryEntry,
  Model as MusicHistoryEntry,
  Entity as MusicHistoryEntryEntity,
  modelSchema as musicHistoryEntrySchema,
  entitySchema as musicHistoryEntryEntitySchema,
};
