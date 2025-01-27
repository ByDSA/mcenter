import { z } from "zod";

const updateEpisodesFileRequestSchema = z.object( {
  query: z.object( {
    forceHash: z.enum(["0", "1", "true", "false"]).optional(),
  } ),
} );

export type UpdateEpisodesFileRequest = z.infer<typeof updateEpisodesFileRequestSchema>;

export function assertIsUpdateEpisodesFileRequest(
  o: unknown,
): asserts o is UpdateEpisodesFileRequest {
  updateEpisodesFileRequestSchema.parse(o);
}
