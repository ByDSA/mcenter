import z from "zod";
import { idParamsSchema } from "../../../utils/schemas/requests";

export namespace MusicHistoryEntryRestDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = z.object( {
      filter: z.object( {
        resourceId: z.string().optional(),
        timestampMax: z.number().optional(),
      } ).strict()
        .optional(),
      sort: z.object( {
        timestamp: z.enum(["asc", "desc"]).optional(),
      } ).strict()
        .optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
      expand: z.array(z.enum(["musics", "music-file-infos"])).optional(),
    } ).strict();
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
