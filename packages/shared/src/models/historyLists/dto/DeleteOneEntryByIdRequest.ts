import { z } from "zod";
import { entryWithIdSchema } from "../HistoryEntry";
import { getOneByIdSchema } from "./GetOneByIdRequest";

export const deleteOneEntryByIdSchema = getOneByIdSchema.extend( {
  params: getOneByIdSchema.shape.params.extend( {
    entryId: z.string(),
  } ).strict(),
} ).required();

export type DeleteOneEntryByIdRequest = z.infer<typeof deleteOneEntryByIdSchema>;

export function assertIsDeleteOneEntryByIdRequest(
  o: unknown,
): asserts o is DeleteOneEntryByIdRequest {
  deleteOneEntryByIdSchema.parse(o);
}

export type DeleteOneEntryByIdReqBody = undefined;

export const deleteOneEntryByIdResBodySchema = z.object( {
  entry: entryWithIdSchema,
} ).strict();

export type DeleteOneEntryByIdResBody = z.infer<typeof deleteOneEntryByIdResBodySchema>;

export function assertIsDeleteOneEntryByIdResBody(
  o: unknown,
): asserts o is DeleteOneEntryByIdResBody {
  deleteOneEntryByIdResBodySchema.parse(o);
}
