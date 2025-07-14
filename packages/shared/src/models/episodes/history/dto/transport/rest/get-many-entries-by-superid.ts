import { getOneByIdReqParamsSchema } from "./get-one-by-id";
import { criteriaSchema } from "./get-many-entries-by-criteria";

const reqParamsSchema = getOneByIdReqParamsSchema;
const reqBodySchema = criteriaSchema;

export const getManyEntriesBySuperId = {
  reqParamsSchema,
  reqBodySchema,
};
