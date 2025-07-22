import z from "zod";
import { episodeCompKeySchema } from "../episode";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { episodeEntitySchema } from "../episode";
import { createCriteriaSchema } from "../../utils/schemas/requests/criteria";

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
    export const criteriaSchema = createCriteriaSchema( {
      filterShape: {
        path: z.string().optional(),
      },
      sortKeys: [],
      expandKeys: ["series"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(episodeEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const { paramsSchema } = EpisodesRestDtos.GetOneById;
  }
}
