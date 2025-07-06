import { z } from "zod";
import { entryWithIdSchema } from "../HistoryEntry";
import { getOneByIdReqParamsSchema } from "./GetOneById";

const reqParamsSchema = getOneByIdReqParamsSchema.extend( {
  entryId: z.string(),
} ).strict();

export const resBodySchema = z.object( {
  deleted: entryWithIdSchema.array(),
} ).strict();

export const deleteOneEntryById = {
  reqParamsSchema,
  resBodySchema,
};
