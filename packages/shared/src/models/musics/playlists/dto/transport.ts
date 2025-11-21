import z from "zod";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { musicPlaylistEntitySchema, musicPlaylistSchema } from "../playlist";
import { mongoDbId } from "../../../resources/partial-schemas";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
    slug: z.string().optional(),
    userId: mongoDbId.optional(),
  },
  sortKeys: ["added", "updated"] as const,
  expandKeys: ["musics"] as const,
};

export namespace MusicPlaylistCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export namespace ById {
      export const paramsSchema = idParamsSchema;
    }
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
        userId: true,
      } );
    export type Body = z.infer<typeof bodySchema>;
  }
}
