import { z, ZodSchema } from "zod";
import { paramsSchema as getOneByIdParamsSchema } from "./GetOneById";

const paramsSchema = getOneByIdParamsSchema;

export function createDeletedResponseSchema(item: ZodSchema): ZodSchema {
  return z.object( {
    deleted: item.array(),
  } ).strict();
}

export const deleteOneById = {
  reqParamsSchema: paramsSchema,
  createDeletedResponseSchema,
};
