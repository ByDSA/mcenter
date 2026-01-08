import z from "zod";
import { createOneResultResponseSchema } from "../../../utils/http/responses";
import { slugSchema } from "../../utils/schemas/slug";
import { idParamsSchema } from "../../utils/schemas/requests";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { musicEntitySchema } from "../music";
import { createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../resources/partial-schemas";

const criteriaConfig = {
  filterShape: {
    id: z.string().optional(),
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
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseDataSchema = musicEntitySchema;
    export const responseSchema = createOneResultResponseSchema(responseDataSchema);
    export type Response = z.infer<typeof responseSchema>;
    export namespace ById {
      export const paramsSchema = idParamsSchema;
    }
  }

  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }
  export namespace DeleteOneById {
    export const paramsSchema = idParamsSchema;
  }
}
