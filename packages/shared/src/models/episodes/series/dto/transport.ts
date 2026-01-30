import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { createCriteriaConfig, createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { seriesEntitySchema, seriesSchema } from "../serie";

const criteriaConfig = createCriteriaConfig( {
  filterShape: {
    id: mongoDbId.optional(),
    title: z.string().optional(),
    key: z.string().optional(),
    search: z.string().optional(),
  },
  sortKeys: ["title", "added", "updated"],
  expandKeys: ["imageCover", "countEpisodes", "countSeasons"],
} );

export namespace SeriesCrudDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(seriesEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace CreateOne {
    export const bodySchema = seriesSchema.pick( {
      imageCoverId: true,
      key: true,
      name: true,
    } )
      .partial( {
        key: true,
      } )
      .strict();

    export type Body = z.infer<typeof bodySchema>;
  }
}
