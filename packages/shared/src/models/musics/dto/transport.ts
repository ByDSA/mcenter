import z from "zod";
import { createOneResultResponseSchema, createPaginatedResultResponseSchema, createManyResultResponseSchema } from "../../../utils/http/responses";
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
      fileInfos: true,
      userInfo: true,
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

  export namespace PickRandom {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace BulkPatch {
    const musicFieldsSchema = musicEntitySchema.pick( {
      artist: true,
      album: true,
      country: true,
      game: true,
      year: true,
      tags: true,
    } );

    const userInfoFieldsSchema = z.object( {
      weight: z.number(),
      tags: z.array(z.string()).optional(),
    } );

    export const bodySchema = z
      .object( {
        ids: z.array(mongoDbId).min(1),
        music: generatePatchBodySchema(musicFieldsSchema).optional(),
        userInfo: generatePatchBodySchema(userInfoFieldsSchema).optional(),
      } )
      .refine(
        (data) => data.music !== undefined || data.userInfo !== undefined,
        {
          message: "Se debe especificar al menos music o userInfo",
        },
      );

    export type Body = z.infer<typeof bodySchema>;

    const musicIdsNotFoundWarningSchema = z.object( {
      code: z.literal("MUSIC_IDS_NOT_FOUND"),
      notFoundMusicIds: z.array(mongoDbId),
    } );

    const userInfoIdsNotFoundWarningSchema = z.object( {
      code: z.literal("USER_INFO_IDS_NOT_FOUND"),
      notFoundMusicIds: z.array(mongoDbId),
    } );

    export const warningSchema = musicIdsNotFoundWarningSchema.or(userInfoIdsNotFoundWarningSchema);
    export type Warning = z.infer<typeof warningSchema>;

    export const responseSchema = createManyResultResponseSchema(musicEntitySchema, {
      warningsSchema: warningSchema,
    } );
    export type Response = z.infer<typeof responseSchema>;
    export type Return = Response;
  }
}
