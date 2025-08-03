import z from "zod";
import { mongoDbId } from "../../../models/resource/partial-schemas";
import { genAssertZod } from "../../../utils/validation/zod";
import { makeHistoryEntrySchema } from "../../history-lists-common";
import { musicEntitySchema, musicIdSchema } from "../music";

const modelSchema = makeHistoryEntrySchema(musicIdSchema);

type Model = z.infer<typeof modelSchema>;
const entitySchema = modelSchema.extend( {
  id: mongoDbId,
  resource: musicEntitySchema.optional(),
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
