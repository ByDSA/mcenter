import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { episodeCompKeySchema } from "../episode";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { episodeEntitySchema } from "../episode";
import { createCriteriaConfig, createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";

const criteriaConfig = createCriteriaConfig( {
  filterShape: {
    id: mongoDbId.optional(),
    path: z.string().optional(),
    seriesKey: z.string().optional(),
    episodeKey: z.string().optional(),
    episodeKeys: z.array(z.string()).optional(),
    seriesKeys: z.array(z.string()).optional(),
  },
  sortKeys: ["episodeCompKey", "createdAt", "updatedAt"],
  expandKeys: ["series", "file-infos", "user-info"],
} );

export namespace EpisodesCrudDtos {
  export namespace GetAll {
    export const paramsSchema = z.object( {
      seriesKey: z.string(),
    } ).strict()
      .required();
  }
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export namespace ById {
      export const paramsSchema = episodeCompKeySchema.required();
    }

    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(episodeEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const { paramsSchema } = EpisodesCrudDtos.GetOne.ById;
  }
}
