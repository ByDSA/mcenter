import z from "zod";
import { assertZodPopStack } from "../../../utils/validation/zod";
import { episodeHistoryEntrySchema } from "./history-entry";

const idSchema = z.string();

type Id = z.infer<typeof idSchema>;

const schema = z.object( {
  id: z.string(),
  entries: z.array(episodeHistoryEntrySchema),
  maxSize: z.number(),
} ).strict();

type Model = z.infer<typeof schema>;

function assertIsModel(model: Model): asserts model is Model {
  assertZodPopStack(schema, model);
}

export {
  schema as episodeHistoryListEntitySchema,
  assertIsModel as assertIsEpisodeHistoryListEntity,
  Model as EpisodeHistoryListEntity,
  Id as EpisodeHistoryListId,
  idSchema as episodeHistoryListIdSchema,
};
