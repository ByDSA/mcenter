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
  },
  sortKeys: ["added", "updated", "user"] as const,
  expandKeys: ["musics", "musicsFavorite", "ownerUserPublic", "imageCover"] as const,
};

export namespace MusicPlaylistCrudDtos {
  const responseOneSchema = createOneResultResponseSchema(musicPlaylistEntitySchema);
  const responseManySchema = createManyResultResponseSchema(musicPlaylistEntitySchema);

  const skippedDuplicatesWarningSchema = z.object( {
    code: z.literal("DUPLICATES_SKIPPED"),
    skippedMusicIds: z.array(mongoDbId),
  } );

  const tracksNotFoundWarningSchema = z.object( {
    code: z.literal("TRACKS_NOT_FOUND"),
    notFoundTrackIds: z.array(mongoDbId),
  } );

  const musicIdsNotFoundWarningSchema = z.object( {
    code: z.literal("MUSIC_IDS_NOT_FOUND"),
    notFoundMusicIds: z.array(mongoDbId),
  } );

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
    export const bodySchema = generatePatchBodySchema(musicPlaylistEntitySchema
      // Para que se permita enviar cualquier slug y el backend haga el fixer
      .omit( {
        slug: true,
        list: true,
        imageCover: true,
        ownerUser: true,
      } ).extend( {
        slug: z.string()
          .min(1),
        list: z.array(
          musicPlaylistEntitySchema.shape.list.element.omit( {
            music: true,
          } ),
        ),
      } ));
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
        slug: true,
        updatedAt: true,
        ownerUserId: true,
      } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace AddManyTracks {
    export const dataSchema = musicPlaylistEntitySchema;

    export type Data = z.infer<typeof dataSchema>;
    export const bodySchema = z.object( {
      musics: z.array(mongoDbId),
      allowDuplicates: z.boolean().optional(),
    } );

    export type Body = z.infer<typeof bodySchema>;

    export const warningSchema = skippedDuplicatesWarningSchema;
    export type Warning = z.infer<typeof warningSchema>;

    export const returnSchema = createOneResultResponseSchema(
      musicPlaylistEntitySchema,
      {
        warningsSchema: warningSchema,
      },
    );
    export const responseSchema = returnSchema;
    export type Return = z.infer<typeof returnSchema>;
    export type Response = Return;
}

  export namespace RemoveManyTracks {
    export const warningSchema = tracksNotFoundWarningSchema.or(musicIdsNotFoundWarningSchema);
    export type Warning = z.infer<typeof warningSchema>;

    export const returnSchema = createOneResultResponseSchema(
      musicPlaylistEntitySchema,
      {
        warningsSchema: warningSchema,
      },
    );
    export type Return = z.infer<typeof returnSchema>;

    export const responseSchema = returnSchema;
    export type Response = Return;

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
