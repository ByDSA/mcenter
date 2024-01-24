import { z } from "zod";
import { EntryWithIdSchema } from "../HistoryEntry";
import { GetOneByIdSchema } from "./GetOneByIdRequest";

export const DeleteOneEntryByIdSchema = GetOneByIdSchema.extend( {
  params: GetOneByIdSchema.shape.params.extend( {
    entryId: z.string(),
  } ).strict(),
} ).required();

export type DeleteOneEntryByIdRequest = z.infer<typeof DeleteOneEntryByIdSchema>;

export function assertIsDeleteOneEntryByIdRequest(o: unknown): asserts o is DeleteOneEntryByIdRequest {
  DeleteOneEntryByIdSchema.parse(o);
}

export type DeleteOneEntryByIdReqBody = undefined;

export const DeleteOneEntryByIdResBodySchema = z.object( {
  entry: EntryWithIdSchema,
} ).strict();

export type DeleteOneEntryByIdResBody = z.infer<typeof DeleteOneEntryByIdResBodySchema>;

export function assertIsDeleteOneEntryByIdResBody(o: unknown): asserts o is DeleteOneEntryByIdResBody {
  DeleteOneEntryByIdResBodySchema.parse(o);
}