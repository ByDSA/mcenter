import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { musicFileInfoEntitySchema } from "../file-info";
import { musicEntitySchema } from "../../music";
import { createUploadFileResponseSchema } from "../../../utils/schemas/files";

export namespace MusicFileInfoCrudDtos {
  export namespace GetOneById {
  }
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      expandKeys: [],
      filterShape: {
        musicId: mongoDbId,
      },
      sortKeys: [],
    } );

    export type Criteria = z.infer<typeof criteriaSchema>;

    export const responseSchema = createManyResultResponseSchema(musicFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace CreateOne {
    export const bodySchema = musicFileInfoEntitySchema.omit( {
      id: true,
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(musicFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace PatchOne {
    export const bodySchema = generatePatchBodySchema(CreateOne.bodySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(musicFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace UploadFile {
    export const requestBodySchema = z.object( {
      metadata: z.object( {
        musicId: z.string()
          .optional(),
      } ),
    } );

    export type RequestBody = z.infer<typeof requestBodySchema>;

    export const responseSchema = createUploadFileResponseSchema( {
      music: musicEntitySchema.or(z.undefined()),
      fileInfo: musicFileInfoEntitySchema,
    } );

    export type Response = z.infer<typeof responseSchema>;
  }
}
