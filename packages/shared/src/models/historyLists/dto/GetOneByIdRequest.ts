import { z } from "zod";

export const GetOneByIdSchema = z.object( {
  params: z.object( {
    id: z.string( {
      required_error: "id is required",
    } ),
  } ),
} );

export type GetOneByIdRequest = z.infer<typeof GetOneByIdSchema>;

export function assertIsGetOneByIdRequest(o: unknown): asserts o is GetOneByIdRequest {
  GetOneByIdSchema.parse(o);
}