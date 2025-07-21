import z from "zod";
import { episodeHistoryEntrySchema } from "../history-entry";

export namespace EpisodeHistoryEntryDtos {
  export const schema = episodeHistoryEntrySchema;
  export type Dto = z.infer<typeof schema>;
};
