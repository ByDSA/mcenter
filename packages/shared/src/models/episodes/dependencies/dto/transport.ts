import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { episodeCompKeySchema } from "../../episode";

export namespace EpisodeDependencyCrudDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        lastCompKey: episodeCompKeySchema.optional(),
      },
      sortKeys: [],
      expandKeys: ["episodes"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace DeleteOneById {
    export const paramsSchema = z.object( {
      id: mongoDbId,
    } );
  }
};
