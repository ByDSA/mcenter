import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";

export namespace EpisodeHistoryEntryCrudDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        seriesKey: z.string().optional(),
        episodeKey: z.string().optional(),
        timestampMax: z.number().optional(),
        userId: mongoDbId.optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: ["episodesSeries", "episodes", "episodesFileInfos", "episodesUserInfo"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
};
