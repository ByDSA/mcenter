import z from "zod";
import { createOneResultResponseSchema, createPaginatedResultResponseSchema } from "../../../utils/http/responses";
import { slugSchema } from "../../utils/schemas/slug";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { movieEntitySchema } from "../movie";
import { createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../resources/partial-schemas";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
    ids: z.array(mongoDbId).optional(),
    slug: slugSchema.optional(),
    title: z.string().optional(),
    genre: z.string().optional(),
    year: z.number().int()
      .optional(),
    director: z.string().optional(),
  },
  sortKeys: ["createdAt", "updatedAt", "title", "year"] as const,
  expandKeys: [] as const,
};

export namespace MovieCrudDtos {
  const responseOneSchema = createOneResultResponseSchema(movieEntitySchema);

  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseSchema = createPaginatedResultResponseSchema(movieEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseDataSchema = movieEntitySchema;
    export const responseSchema = createOneResultResponseSchema(responseDataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const repoDto = movieEntitySchema.omit( {
      id: true,
      createdAt: true,
      updatedAt: true,
      addedAt: true,
      imageCover: true,
    } );
    export type RepoDto = z.infer<typeof repoDto>;

    // bodySchema: lo que llega desde el cliente HTTP (sin uploaderUserId, que lo pone el servidor)
    export const bodySchema = repoDto.omit( {
      uploaderUserId: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(movieEntitySchema.omit( {
      createdAt: true,
      updatedAt: true,
      addedAt: true,
      uploaderUserId: true,
      imageCover: true,
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
