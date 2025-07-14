import { paramsSchema as getOneByIdParamsSchema } from "./get-one-by-id";

const paramsSchema = getOneByIdParamsSchema;

export const deleteOneById = {
  reqParamsSchema: paramsSchema,
};
