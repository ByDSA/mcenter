import { z } from "zod";
import { modelSchema } from "../Stream";

export const getManyResponseSchema = z.array(modelSchema);

export type GetManyResponse = z.infer<typeof getManyResponseSchema>;

export function assertIsGetResponse(o: unknown): asserts o is GetManyResponse {
  getManyResponseSchema.parse(o);
}
