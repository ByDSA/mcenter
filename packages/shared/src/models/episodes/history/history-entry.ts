import z from "zod";
import { dateSchema } from "../../../models/utils/schemas/timestamps/date";
import { userEntitySchema } from "../../auth";
import { mongoDbId } from "../../resources/partial-schemas";
import { genAssertZod } from "../../../utils/validation/zod";
import { episodeEntitySchema } from "..";
import { streamEntitySchema } from "../streams";

const schema = z.object( {
  resourceId: mongoDbId,
  date: dateSchema,
  streamId: mongoDbId,
  userId: mongoDbId,
} ).strict();

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
  type Entity as EpisodeHistoryEntryEntity,
  type Model as EpisodeHistoryEntry,
  schema as episodeHistoryEntrySchema,
};
