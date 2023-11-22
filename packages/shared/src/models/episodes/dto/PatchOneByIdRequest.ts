import { z } from "zod";
import { EpisodeSchema } from "..";
import { GetOneByIdSchema } from "./GetOneByIdRequest";

export const PatchOneByIdSchema = GetOneByIdSchema.extend( {
  body: EpisodeSchema.partial()
    .strict(),
} ).required();

export type PatchOneByIdRequest = z.infer<typeof PatchOneByIdSchema>;

export function assertIsPatchOneByIdRequest(o: unknown): asserts o is PatchOneByIdRequest {
  PatchOneByIdSchema.parse(o);
}