import { getOneByIdReqParamsSchema } from "./GetOneById";
import { searchSchema } from "./Criteria";

const reqParamsSchema = getOneByIdReqParamsSchema;
const reqBodySchema = searchSchema;

export const getManyEntriesBySuperId = {
  reqParamsSchema,
  reqBodySchema,
};
