import { z } from "zod";

export const logElementResponseSchema = z.object( {
  message: z.string(),
  type: z.string(),
  data: z.any().optional(),
} ).strict();

export type LogElementResponse = z.infer<typeof logElementResponseSchema>;

export function assertIsLogElement(o: unknown): asserts o is LogElementResponse {
  logElementResponseSchema.parse(o);
}
