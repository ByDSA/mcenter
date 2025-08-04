import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";

export namespace EpisodeHistoryEntryCrudDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        seriesKey: z.string().optional(),
        episodeKey: z.string().optional(),
        timestampMax: z.number().optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: ["series", "episodes", "episode-file-infos"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
};
