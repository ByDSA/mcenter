import { z } from "zod";
import { ModelSchema } from "../Stream";

export const GetManyResponseSchema = z.array(ModelSchema);

export type GetManyResponse = z.infer<typeof GetManyResponseSchema>;

export function assertIsGetResponse(o: unknown): asserts o is GetManyResponse {
  GetManyResponseSchema.parse(o);
}