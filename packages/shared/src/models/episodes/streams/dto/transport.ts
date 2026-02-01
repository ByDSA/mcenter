import z from "zod";
import { createManyResultResponseSchema } from "../../../../utils/http/responses";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { streamEntitySchema } from "../stream";

export namespace StreamCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      sortKeys: ["lastTimePlayed"],
      expandKeys: ["series"],
      filterShape: {},
    } );

    export type Criteria = z.infer<typeof criteriaSchema>;

    export const dataSchema = streamEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createManyResultResponseSchema(dataSchema);
  }
}
