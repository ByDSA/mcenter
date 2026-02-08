import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";

export namespace EpisodeDependencyCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        lastEpisodeId: mongoDbId.optional(),
      },
      sortKeys: [],
      expandKeys: ["episodes"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace Delete {

  }
};
