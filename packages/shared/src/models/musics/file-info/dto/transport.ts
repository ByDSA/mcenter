import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { musicFileInfoEntitySchema } from "../file-info";
import { musicEntitySchema } from "../../music";

export namespace MusicFileInfoCrudDtos {
  export namespace GetOneById {
    export const paramsSchema = idParamsSchema;
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
  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(musicFileInfoEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
    export const responseSchema = createOneResultResponseSchema(musicFileInfoEntitySchema);
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace DeleteOneById {
    export const paramsSchema = idParamsSchema;
  }

  export namespace UploadFile {
    export const requestBodySchema = z.object( {
      metadata: z.object( {
        musicId: z.string()
          .optional(),
      } ),
    } );

    export type RequestBody = z.infer<typeof requestBodySchema>;
    const uploadedFileSchema = z.object( {
      originalName: z.string(),
      filename: z.string(),
      path: z.string(),
      size: z.number(),
      mimetype: z.string(),
      uploadDate: z.string(), // ISO string format
    } );

    export const responseSchema = z.object( {
      message: z.string(),
      meta: z.object( {
        body: requestBodySchema,
        file: uploadedFileSchema,
      } ),
      data: z.object( {
        music: musicEntitySchema.or(z.undefined()),
        fileInfo: musicFileInfoEntitySchema,
      } ),
    } );

    export type Response = z.infer<typeof responseSchema>;
  }
}
