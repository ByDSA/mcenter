import z from "zod";
import { generatePatchBodySchema } from "../../../../models/utils/schemas/patch";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { musicPlaylistEntitySchema, musicPlaylistSchema } from "../playlist";
import { mongoDbId } from "../../../resources/partial-schemas";
import { slugSchema } from "../../../utils/schemas/slug";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
    slug: slugSchema.optional(),
    ownerUserId: mongoDbId.optional(),
    ownerUserSlug: slugSchema.optional(),
    requestUserId: mongoDbId.optional(),
  },
  sortKeys: ["added", "updated"] as const,
  expandKeys: ["musics", "musicsFavorite", "ownerUserPublic", "imageCover"] as const,
};

export namespace MusicPlaylistCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;

  }

  export namespace GetOneById {
    const { id: _, ...filterShape } = criteriaConfig.filterShape;
    export const criteriaSchema = createCriteriaOneSchema( {
      ...criteriaConfig,
      filterShape,
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const paramsSchema = idParamsSchema;
  }

  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicPlaylistEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }

  export namespace DeleteOneById {
    export const paramsSchema = idParamsSchema;
  }
  export namespace CreateOne {
    export const bodySchema = musicPlaylistSchema
      .omit( {
        createdAt: true,
        list: true,
        updatedAt: true,
        ownerUserId: true,
      } );
    export type Body = z.infer<typeof bodySchema>;
  }
}
