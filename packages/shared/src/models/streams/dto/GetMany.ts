import { z } from "zod";
import { modelSchema } from "../Stream";
import { searchSchema } from "./Criteria";

export const getManyBySearch = {
  reqBodySchema: searchSchema,
  resSchema: z.array(modelSchema),
};
