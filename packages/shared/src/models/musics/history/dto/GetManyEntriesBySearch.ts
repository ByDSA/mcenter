import { z } from "zod";
import { entrySchema } from "../Entry";
import { searchSchema } from "./Criteria";

const reqBodySchema = searchSchema.default( {} );
const resSchema = z.array(entrySchema);

export const getManyEntriesBySearch = {
  reqBodySchema,
  resSchema,
};
