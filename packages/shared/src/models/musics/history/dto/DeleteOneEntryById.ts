import { z } from "zod";
import { genAssertZod } from "../../../../utils/validation/zod";
import { entrySchema } from "../Entry";
import { getOneByIdReqSchema } from "./GetOneByIdReq";

export const deleteOneEntryByIdSchema = getOneByIdReqSchema;

export type DeleteOneEntryByIdRequest = z.infer<typeof deleteOneEntryByIdSchema>;

export const assertIsDeleteOneEntryByIdReq = genAssertZod(deleteOneEntryByIdSchema);

export type DeleteOneEntryByIdReqBody = undefined;

export const deleteOneEntryByIdResBodySchema = z.object( {
  entry: entrySchema,
} ).strict();

export type DeleteOneEntryByIdResBody = z.infer<typeof deleteOneEntryByIdResBodySchema>;

export const assertIsDeleteOneEntryByIdResBody = genAssertZod(deleteOneEntryByIdResBodySchema);
