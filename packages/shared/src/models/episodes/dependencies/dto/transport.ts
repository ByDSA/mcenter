import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { episodeCompKeySchema } from "../../episode";

export namespace EpisodeDependencyCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        lastCompKey: episodeCompKeySchema.optional(),
      },
      sortKeys: [],
      expandKeys: ["episodes"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace Delete {

  }
};
