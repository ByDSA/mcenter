import z from "zod";
import { dateTypeSchema } from "../../../utils/time";
import { assertZodPopStack } from "../../../utils/validation/zod";
import { episodeEntitySchema, episodeIdSchema } from "..";
import { serieEntitySchema } from "../../series";

const idSchema = z.string();

type Id = z.infer<typeof idSchema>;

const schema = z.object( {
  episodeId: episodeIdSchema,
  date: dateTypeSchema,
} ).strict();

type Model = z.infer<typeof schema>;

function assertIsModel(model: unknown): asserts model is Model {
  assertZodPopStack(schema, model);
}

const entitySchema = schema
  .extend( {
    id: idSchema,
    serie: serieEntitySchema.optional(),
    episode: episodeEntitySchema.optional(),
  } )
  .strict();

type Entity = z.infer<typeof entitySchema>;

function assertIsEntity(model: unknown): asserts model is Entity {
  assertZodPopStack(entitySchema, model);
}

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
