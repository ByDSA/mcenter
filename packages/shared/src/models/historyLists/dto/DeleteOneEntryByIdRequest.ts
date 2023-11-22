import { z } from "zod";
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