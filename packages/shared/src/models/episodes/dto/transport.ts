import z from "zod";
import { episodeCompKeySchema } from "../episode";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { episodeEntitySchema } from "../episode";

export namespace EpisodesRestDtos {
  export namespace GetOneById {
    export const paramsSchema = episodeCompKeySchema.required();
  }
  export namespace GetAll {
    export const paramsSchema = z.object( {
      seriesKey: z.string(),
    } ).strict()
      .required();
  }
  export namespace GetManyByCriteria {
    export const criteriaSchema = z.object( {
      filter: z.object( {
        path: z.string().optional(),
      } ).strict()
        .optional(),
      sort: z.object( {} ).strict()
        .optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
      expand: z.array(z.enum(["series"])).optional(),
    } ).strict();
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(episodeEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const { paramsSchema } = EpisodesRestDtos.GetOneById;
  }
}
