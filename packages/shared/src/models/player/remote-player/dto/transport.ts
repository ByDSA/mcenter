import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { idParamsSchema } from "../../../utils/schemas/requests";
import { createCriteriaManySchema, createCriteriaOneSchema } from "../../../utils/schemas/requests/criteria";
import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { remotePlayerEntitySchema } from "..";

const criteriaConfig = {
  filterShape: {
    id: mongoDbId.optional(),
  },
  sortKeys: [] as const,
  expandKeys: ["owner", "permissions"] as const,
};

export namespace RemotePlayerCrudDtos {
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
    export const bodySchema = generatePatchBodySchema(remotePlayerEntitySchema);
    export type Body = z.infer<typeof bodySchema>;
    export const paramsSchema = idParamsSchema;
  }
  export namespace DeleteOneById {
    export const paramsSchema = idParamsSchema;
  }
}
