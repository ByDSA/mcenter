import { z } from "zod";
import { logElementResponseSchema } from "./LogElement";

const schema = logElementResponseSchema.extend( {
  trace: z.array(z.string()).optional(),
} ).strict();

export type ErrorElementResponse = z.infer<typeof schema>;

export function assertIsErrorElementResponse(o: unknown): asserts o is ErrorElementResponse {
  schema.parse(o);
}

export function errorToErrorElementResponse(err: Error): ErrorElementResponse {
  const [_, ...stack] = err.stack?.split("\n").map(s => s.trim()) ?? [];
  const error: ErrorElementResponse = {
    message: err.message,
    trace: stack,
    type: typeof err,
  };

  return error;
}
