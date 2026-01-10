import z from "zod";
import { mongoDbId } from "../../../models/resources/partial-schemas";
import { createOneResultResponseSchema } from "../../../utils/http/responses";
import { idParamsSchema } from "../../utils/schemas/requests";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";
import { imageCoverEntitySchema } from "../imageCover";

const criteriaConfig = {
  filterShape: {
    searchLabel: z.string().optional(),
    id: mongoDbId.optional(),
  },
  sortKeys: [] as const,
  expandKeys: [] as const,
};

export namespace ImageCoverCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
  }

  export namespace GetOne {
    export const criteriaSchema = createCriteriaOneSchema(criteriaConfig);
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const responseDataSchema = imageCoverEntitySchema;
    export const responseSchema = createOneResultResponseSchema(responseDataSchema);
    export type Response = z.infer<typeof responseSchema>;
    export namespace ById {
      export const paramsSchema = idParamsSchema;
    }
  }

  export namespace PatchOneById {
    export const bodySchema = generatePatchBodySchema(imageCoverEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }

  export namespace DeleteOneById {
    export const paramsSchema = idParamsSchema;
  }

  export namespace UploadFile {
    export const requestBodySchema = z.object( {
      metadata: z.object( {
        imageCoverId: z.string().optional(),
        label: z.string().optional(),
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
        imageCover: imageCoverEntitySchema,
      } ),
    } );

    export type Response = z.infer<typeof responseSchema>;
  }
}
