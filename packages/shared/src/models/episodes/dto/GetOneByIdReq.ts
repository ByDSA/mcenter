import { z } from "zod";

export const Schema = z.object( {
  params: z.object( {
    episodeId: z.string(),
    serieId: z.string(),
  } ).strict()
    .required(),
} );

export type GetOneByIdRequest = z.infer<typeof Schema>;

export function assertIsGetOneByIdRequest(o: unknown): asserts o is GetOneByIdRequest {
  Schema.parse(o);
}