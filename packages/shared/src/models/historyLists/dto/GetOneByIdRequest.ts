import { z } from "zod";

export const getOneByIdSchema = z.object( {
  params: z.object( {
    id: z.string( {
      // eslint-disable-next-line camelcase
      required_error: "id is required",
    } ),
  } ),
} );

export type GetOneByIdRequest = z.infer<typeof getOneByIdSchema>;

export function assertIsGetOneByIdRequest(o: unknown): asserts o is GetOneByIdRequest {
  getOneByIdSchema.parse(o);
}
