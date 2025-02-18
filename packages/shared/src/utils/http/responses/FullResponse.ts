import { z } from "zod";
import { logElementResponseSchema } from "./LogElement";

const fullResponseSchema = z.object( {
  errors: z.array(logElementResponseSchema).optional(),
  warnings: z.array(logElementResponseSchema).optional(),
  data: z.any().optional(),
} ).strict();

export type FullResponse<T = any> = z.infer<typeof fullResponseSchema> & {
  data?: T;
};

export function assertIsModel<T>(o: unknown): asserts o is FullResponse<T> {
  fullResponseSchema.parse(o);
}
