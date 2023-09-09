import { z } from "zod";

export const GetOneByIdSchema = z.object( {
  params: z.object( {
    episodeId: z.string(),
    serieId: z.string(),
  } ).strict()
    .required(),
} );

export type GetOneByIdRequest = z.infer<typeof GetOneByIdSchema>;

export function assertIsGetOneByIdRequest(o: unknown): asserts o is GetOneByIdRequest {
  GetOneByIdSchema.parse(o);
}