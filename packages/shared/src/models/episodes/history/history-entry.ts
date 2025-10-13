import z from "zod";
import { userEntitySchema } from "../../auth";
import { mongoDbId } from "../../resources/partial-schemas";
import { genAssertZod } from "../../../utils/validation/zod";
import { episodeEntitySchema, episodeCompKeySchema } from "..";
import { streamEntitySchema } from "../../streams";
import { makeHistoryEntrySchema } from "../../history-lists-common";

const schema = makeHistoryEntrySchema(episodeCompKeySchema).extend( {
  streamId: mongoDbId,
  userId: mongoDbId,
} )
  .strict();

type Model = z.infer<typeof schema>;

const assertIsModel = genAssertZod(schema);
const entitySchema = schema
  .extend( {
    id: mongoDbId,
    resource: episodeEntitySchema.optional(),
    stream: streamEntitySchema.optional(),
    user: userEntitySchema.optional(),
  } )
  .strict();

type Entity = z.infer<typeof entitySchema>;

const assertIsEntity = genAssertZod(entitySchema);

export {
  entitySchema as episodeHistoryEntryEntitySchema,
  assertIsModel as assertIsEpisodeHistoryEntry,
  assertIsEntity as assertIsEpisodeHistoryEntryEntity,
  Entity as EpisodeHistoryEntryEntity,
  Model as EpisodeHistoryEntry,
  schema as episodeHistoryEntrySchema,
};
