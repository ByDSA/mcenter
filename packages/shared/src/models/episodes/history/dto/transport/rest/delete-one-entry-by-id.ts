import z from "zod";
import { getOneByIdReqParamsSchema } from "./get-one-by-id";

const reqParamsSchema = getOneByIdReqParamsSchema.extend( {
  entryId: z.string(),
} ).strict();

export const deleteOneEntryById = {
  reqParamsSchema,
};
