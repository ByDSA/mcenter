import z from "zod";
import { createOneResultResponseSchema, createPaginatedResultResponseSchema } from "../../../utils/http/responses";
import { slugSchema } from "../../utils/schemas/slug";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { musicEntitySchema } from "../music";
import { createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../resources/partial-schemas";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
    ids: z.array(mongoDbId).optional(),
    slug: slugSchema.optional(),
    title: z.string().optional(),
    artist: z.string().optional(),
    hash: z.string().optional(),
    path: z.string().optional(),
    userId: mongoDbId.optional(), // Para playlist de favorites
  },
  sortKeys: ["added", "updated", "artist"] as const,
  expandKeys: ["fileInfos", "userInfo", "favorite", "imageCover"] as const,
};

export namespace MusicCrudDtos {
  const responseOneSchema = createOneResultResponseSchema(musicEntitySchema);
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = createPaginatedResultResponseSchema(musicEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseDataSchema = musicEntitySchema;
    export const responseSchema = createOneResultResponseSchema(responseDataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(musicEntitySchema.omit( {
      uploaderUserId: true,
      createdAt: true,
      updatedAt: true,
      addedAt: true,
    } ).extend( {
      slug: z.string(),
    } ));
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace Delete {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
}
