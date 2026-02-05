import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { createCriteriaConfig, createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { seriesEntitySchema, seriesSchema } from "../serie";
import { createOneResultResponseSchema, createPaginatedResultResponseSchema } from "../../../../utils/http/responses";

const criteriaConfig = createCriteriaConfig( {
  filterShape: {
    id: mongoDbId.optional(),
    ids: z.array(mongoDbId).optional(),
    title: z.string().optional(),
    key: z.string().optional(),
    search: z.string().optional(),
  },
  sortKeys: ["title", "added", "updated"],
  expandKeys: ["imageCover", "countEpisodes", "countSeasons"],
} );

export namespace SeriesCrudDtos {
  const responseOneSchema = createOneResultResponseSchema(seriesEntitySchema);
  const responseManySchema = createPaginatedResultResponseSchema(seriesEntitySchema);

  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = responseManySchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetOne {
    export const responseSchema = responseOneSchema;
  }
  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(seriesEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const bodySchema = seriesSchema.pick( {
      imageCoverId: true,
      key: true,
      name: true,
      releasedOn: true,
    } )
      .partial( {
        key: true,
      } )
      .strict();

    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace Delete {
    export const responseSchema = createOneResultResponseSchema(seriesEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }
}
