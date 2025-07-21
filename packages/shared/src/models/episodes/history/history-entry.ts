import z from "zod";
import { dateTypeSchema } from "../../../utils/time";
import { genAssertZod } from "../../../utils/validation/zod";
import { episodeEntitySchema, episodeCompKeySchema } from "..";
import { serieEntitySchema } from "../../series";

const idSchema = z.string();

type Id = z.infer<typeof idSchema>;

const schema = z.object( {
  episodeCompKey: episodeCompKeySchema,
  date: dateTypeSchema,
} ).strict();

type Model = z.infer<typeof schema>;

const assertIsModel = genAssertZod(schema);
const entitySchema = schema
  .extend( {
    id: idSchema,
    serie: serieEntitySchema.optional(),
    episode: episodeEntitySchema.optional(),
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
  Id as EpisodeHistoryEntryId,
  idSchema as episodeEpisodeHistoryEntryIdSchema,
  schema as episodeHistoryEntrySchema,
};
