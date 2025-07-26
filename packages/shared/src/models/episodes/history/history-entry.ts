import z from "zod";
import { mongoDbId } from "../../resource/partial-schemas";
import { dateTypeSchema } from "../../../utils/time";
import { genAssertZod } from "../../../utils/validation/zod";
import { episodeEntitySchema, episodeCompKeySchema } from "..";
import { serieEntitySchema } from "../../series";
import { streamEntitySchema } from "../../streams";

const schema = z.object( {
  episodeCompKey: episodeCompKeySchema,
  date: dateTypeSchema,
  streamId: mongoDbId,
} ).strict();

type Model = z.infer<typeof schema>;

const assertIsModel = genAssertZod(schema);
const entitySchema = schema
  .extend( {
    id: mongoDbId,
    serie: serieEntitySchema.optional(),
    episode: episodeEntitySchema.optional(),
    stream: streamEntitySchema.optional(),
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
