import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { movieFileInfoEntitySchema } from "../file-info";
import { movieEntitySchema } from "../../movie";
import { createUploadFileResponseSchema } from "../../../utils/schemas/files";

export namespace MovieFileInfoCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      expandKeys: [],
      filterShape: {
        movieId: mongoDbId,
      },
      sortKeys: [],
    } );

    export type Criteria = z.infer<typeof criteriaSchema>;

    export const responseSchema = createManyResultResponseSchema(movieFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    export const bodySchema = movieFileInfoEntitySchema.omit( {
      id: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(movieFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace PatchOne {
    export const bodySchema = generatePatchBodySchema(CreateOne.bodySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(movieFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace UploadFile {
    export const requestBodySchema = z.object( {
      metadata: z.object( {
        movieId: mongoDbId,
      } ).strict(),
    } );

    export type RequestBody = z.infer<typeof requestBodySchema>;

    export const responseSchema = createUploadFileResponseSchema( {
      movie: movieEntitySchema.or(z.undefined()),
      fileInfo: movieFileInfoEntitySchema,
    } );

    export type Response = z.infer<typeof responseSchema>;
  }
}
