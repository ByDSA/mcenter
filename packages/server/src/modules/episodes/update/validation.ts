import { z } from "zod";

const UpdateEpisodesFileRequestSchema = z.object( {
  query: z.object( {
    forceHash: z.enum(["0", "1", "true", "false"]).optional(),
  } ),
} );

export type UpdateEpisodesFileRequest = z.infer<typeof UpdateEpisodesFileRequestSchema>;

export function assertIsUpdateEpisodesFileRequest(
  o: unknown,
): asserts o is UpdateEpisodesFileRequest {
  UpdateEpisodesFileRequestSchema.parse(o);
}
