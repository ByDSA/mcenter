import z from "zod";
import { episodeHistoryEntrySchema } from "../../history-entry";

const schema = episodeHistoryEntrySchema;

type Dto = z.infer<typeof schema>;

export {
  schema as episodeHistoryEntryDtoSchema,
  Dto as EpisodeHistoryEntryDto,
};
