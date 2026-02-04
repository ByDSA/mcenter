import z from "zod";
import { createUploadFileResponseSchema } from "../../utils/schemas/files";
import { mongoDbId } from "../../../models/resources/partial-schemas";
import { createOneResultResponseSchema } from "../../../utils/http/responses";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { createCriteriaOneSchema, createCriteriaManySchema } from "../../utils/schemas/requests/criteria";
import { imageCoverEntitySchema } from "../imageCover";

const criteriaConfig = {
  filterShape: {
    searchLabel: z.string().optional(),
    id: mongoDbId.optional(),
    ids: mongoDbId.array().optional(),
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
  }

  export namespace Patch {
    export const bodySchema = generatePatchBodySchema(imageCoverEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = createOneResultResponseSchema(imageCoverEntitySchema).extend( {
      data: imageCoverEntitySchema,
    } );
  }

  export namespace Delete {
    export const responseSchema = createOneResultResponseSchema(imageCoverEntitySchema);
  }

  export namespace UploadFile {
    export const requestBodySchema = z.object( {
      metadata: z.object( {
        imageCoverId: mongoDbId.optional(),
        label: z.string().optional(),
      } ),
    } );

    export type RequestBody = z.infer<typeof requestBodySchema>;

    export const responseSchema = createUploadFileResponseSchema( {
      imageCover: imageCoverEntitySchema,
    } );

    export type Response = z.infer<typeof responseSchema>;
  }
}
