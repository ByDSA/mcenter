import z from "zod";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";

export namespace MusicHistoryEntryRestDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        resourceId: z.string().optional(),
        timestampMax: z.number().optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: ["musics", "music-file-infos"],
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
