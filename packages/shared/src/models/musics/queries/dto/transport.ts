import z from "zod";
import { createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { musicQuerySchema } from "..";
import { mongoDbId } from "../../../resources/partial-schemas";
import { generatePatchBodySchema } from "../../../../models/utils/schemas/patch";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    ownerUserId: mongoDbId.optional(),
    ownerUserSlug: z.string().optional(),
  },
  sortKeys: ["updated"] as const,
  expandKeys: ["ownerUser", "imageCover"] as const,
};

export namespace MusicQueryCrudDtos {
  export namespace CreateOne {
    export const bodySchema = musicQuerySchema.pick( {
      name: true,
      query: true,
      slug: true,
      visibility: true,
      imageCoverId: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace PatchOneById {
    export const paramsSchema = z.object( {
      id: mongoDbId,
    } );
    export const bodySchema = generatePatchBodySchema(musicQuerySchema);
    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }
}
