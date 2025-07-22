import z from "zod";
import { createCriteriaSchema } from "../../../utils/schemas/requests/criteria";

export namespace EpisodeHistoryEntryRestDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaSchema( {
      filterShape: {
        seriesKey: z.string().optional(),
        episodeKey: z.string().optional(),
        timestampMax: z.number().optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: ["series", "episodes", "episode-file-infos"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const bodySchema = criteriaSchema.default( {} );
  }
};
