import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";

export namespace StreamCrudDtos {
  export namespace GetManyByCriteria {
    export const criteriaSchema = createCriteriaManySchema( {
      sortKeys: ["lastTimePlayed"],
      expandKeys: ["series"],
      filterShape: {},
    } );

    export type Criteria = z.infer<typeof criteriaSchema>;
  }
}
