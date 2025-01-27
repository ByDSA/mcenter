import { z } from "zod";

export const getAllSchema = z.object( {
  params: z.object( {
    serieId: z.string(),
  } ).strict()
    .required(),
} );

export type GetAllRequest = z.infer<typeof getAllSchema>;

export function assertIsGetAllRequest(o: unknown): asserts o is GetAllRequest {
  getAllSchema.parse(o);
}
