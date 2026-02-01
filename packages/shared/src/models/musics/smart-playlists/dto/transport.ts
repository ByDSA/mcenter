import z from "zod";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";
import { createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { musicSmartPlaylistEntitySchema, musicSmartPlaylistSchema } from "..";
import { mongoDbId } from "../../../resources/partial-schemas";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    ownerUserId: mongoDbId.optional(),
    ownerUserSlug: z.string().optional(),
  },
  sortKeys: ["updated"] as const,
  expandKeys: ["ownerUser", "ownerUserPublic", "imageCover"] as const,
};

export namespace MusicSmartPlaylistCrudDtos {
  const responseOneSchema = createOneResultResponseSchema(musicSmartPlaylistEntitySchema);
  export namespace CreateOne {
    export const bodySchema = musicSmartPlaylistSchema.pick( {
      name: true,
      query: true,
      slug: true,
      visibility: true,
      imageCoverId: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace Patch {
    export const paramsSchema = z.object( {
      id: mongoDbId,
    } );
    export const bodySchema = generatePatchBodySchema(musicSmartPlaylistSchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = createManyResultResponseSchema(musicSmartPlaylistEntitySchema);
  }

  export namespace Delete {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
}
