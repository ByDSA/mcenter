import { z } from "zod";

export const GetAllSchema = z.object( {
  params: z.object( {
    serieId: z.string(),
  } ).strict()
    .required(),
} );

export type GetAllRequest = z.infer<typeof GetAllSchema>;

export function assertIsGetAllRequest(o: unknown): asserts o is GetAllRequest {
  GetAllSchema.parse(o);
}