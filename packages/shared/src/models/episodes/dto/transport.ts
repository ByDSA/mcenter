import z from "zod";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../utils/http/responses";
import { mongoDbId } from "../../resources/partial-schemas";
import { episodesBySeasonSchema, episodeSchema } from "../episode";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { episodeEntitySchema } from "../episode";
import { createCriteriaConfig, createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";

const criteriaConfig = createCriteriaConfig( {
  filterShape: {
    ids: z.array(mongoDbId).optional(),
    id: mongoDbId.optional(),
    path: z.string().optional(),
    seriesId: mongoDbId.optional(),
    episodeKey: z.string().optional(),
    episodeKeys: z.array(z.string()).optional(),
    seriesIds: z.array(mongoDbId).optional(),
  },
  sortKeys: ["episodeCompKey", "episodeKey", "createdAt", "updatedAt"] as const,
  expandKeys: ["series", "seriesImageCover", "fileInfos", "userInfo"] as const,
} );

export namespace EpisodesCrudDtos {
  const responseManySchema = createManyResultResponseSchema(episodeEntitySchema);
  const responseOneSchema = createOneResultResponseSchema(episodeEntitySchema);
  export namespace GetAll {
    export const paramsSchema = z.object( {
      seriesKey: z.string(),
    } ).strict()
      .required();
  }
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;

    export const responseSchema = responseManySchema;

    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetOne {
    export namespace ByCompKey {
      export const paramsSchema = z.object( {
        episodeKey: z.string(),
        seriesKey: z.string(),
      } );
    }

    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = responseOneSchema;
  }
  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(episodeEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const compKeyParamsSchema = EpisodesCrudDtos.GetOne.ByCompKey.paramsSchema;
    export const responseSchema = responseOneSchema;
  }

  export namespace CreateOne {
    export const bodySchema = episodeSchema.omit( {
      addedAt: true,
      createdAt: true,
      updatedAt: true,
    } ).strict();

    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace DeleteOne {
    export const responseSchema = createOneResultResponseSchema(episodeEntitySchema.or(z.null()));
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetManyBySeason {
    export const responseSchema = createOneResultResponseSchema(episodesBySeasonSchema);
  }
}
