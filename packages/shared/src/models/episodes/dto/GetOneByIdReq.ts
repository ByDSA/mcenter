import { z } from "zod";

export const schema = z.object( {
  params: z.object( {
    episodeId: z.string(),
    serieId: z.string(),
  } ).strict()
    .required(),
} );

export type GetOneByIdRequest = z.infer<typeof schema>;

export function assertIsGetOneByIdRequest(o: unknown): asserts o is GetOneByIdRequest {
  schema.parse(o);
}
