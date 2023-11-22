import { z } from "zod";
import { LogElementResponseSchema } from "./LogElement";

const Schema = LogElementResponseSchema.extend( {
  trace: z.array(z.string()).optional(),
} ).strict();

type Model = z.infer<typeof Schema>;

export default Model;

export function assertIsModel(o: unknown): asserts o is Model {
  Schema.parse(o);
}

export function errorToErrorElement(err: Error): Model {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, ...stack] = err.stack?.split("\n").map(s => s.trim()) ?? [];
  const error: Model = {
    message: err.message,
    trace: stack,
    type: typeof err,
  };

  return error;
}