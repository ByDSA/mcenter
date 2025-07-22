import z from "zod";
import { idParamsSchema } from "../../utils/schemas/requests";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { musicEntitySchema } from "../music";
import { createCriteriaSchema } from "../../utils/schemas/requests/criteria";

export namespace MusicRestDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaSchema( {
      filterShape: {
        id: z.string().optional(),
        url: z.string().optional(),
        hash: z.string().optional(),
        path: z.string().optional(),
      },
      sortKeys: ["episodeKey"] as const,
      expandKeys: ["fileInfos"] as const,
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = GetMany.criteriaSchema.omit( {
      sort: true,
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
    export namespace ById {
      export const paramsSchema = idParamsSchema;
  }
}
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }
}
