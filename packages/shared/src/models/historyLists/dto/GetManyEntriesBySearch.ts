import { z } from "zod";
import { entryWithIdSchema } from "../HistoryEntry";
import { searchSchema } from "./Criteria";

const reqBodySchema = searchSchema.default( {} );
const resSchema = z.array(entryWithIdSchema);

export const getManyEntriesBySearch = {
  reqBodySchema,
  resSchema,
};
