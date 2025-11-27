import z from "zod";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../../resources/partial-schemas";

export namespace MusicHistoryEntryCrudDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        resourceId: z.string().optional(),
        timestampMax: z.number().optional(),
        userId: mongoDbId.optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: ["musics", "musicsFileInfos", "musicsFavorite"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const bodySchema = criteriaSchema.default( {} );
  }
  export namespace DeleteOneById {
    export const paramsSchema = idParamsSchema;
  }
  export namespace GetOneById {
    export const paramsSchema = idParamsSchema;
  }
};
