import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { genAssertZod } from "../../../utils/validation/zod";
import { episodeEntitySchema } from "..";

const schema = z.object( {
  lastEpisodeId: mongoDbId,
  nextEpisodeId: mongoDbId,
} ).strict();

type Model = z.infer<typeof schema>;

const assertIsModel = genAssertZod(schema);
const entitySchema = schema
  .extend( {
    id: mongoDbId,
    last: episodeEntitySchema.optional(),
    next: episodeEntitySchema.optional(),
  } )
  .strict();

type Entity = z.infer<typeof entitySchema>;

const assertIsEntity = genAssertZod(entitySchema);

export {
  schema as episodeDependencySchema,
  Model as EpisodeDependency,
  assertIsModel as assertIsEpisodeDependency,
  entitySchema as episodeDependencyEntitySchema,
  Entity as EpisodeDependencyEntity,
  assertIsEntity as assertIsEpisodeDependencyEntity,
};
