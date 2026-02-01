import z from "zod";
import { generatePatchBodySchema } from "../../../../models/utils/schemas/patch";
import { createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { musicPlaylistEntitySchema, musicPlaylistSchema } from "../playlist";
import { mongoDbId } from "../../../resources/partial-schemas";
import { slugSchema } from "../../../utils/schemas/slug";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";

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
  const responseOneSchema = createOneResultResponseSchema(musicPlaylistEntitySchema);
  const responseManySchema = createManyResultResponseSchema(musicPlaylistEntitySchema);
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = responseManySchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;

    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;

  }

  export namespace GetOneById {
    const { id: _, ...filterShape } = criteriaConfig.filterShape;
    export const criteriaSchema = createCriteriaOneSchema( {
      ...criteriaConfig,
      filterShape,
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(musicPlaylistEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace Delete {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
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
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace AddOneTrack {
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;

    export const bodySchema = z.object( {
      musics: z.array(mongoDbId),
      unique: z.boolean().optional(),
    } );

    export type Body = z.infer<typeof bodySchema>;
  }
  export namespace RemoveOneTrack {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
    export const bodySchema = z.union([
      z.object( {
        tracks: z.array(mongoDbId),
        musicIds: z.never().optional(),
      } ),
      z.object( {
        musicIds: z.array(mongoDbId),
        tracks: z.never().optional(),
      } ),
    ]);

    export type Body = z.infer<typeof bodySchema>;
  }
}
