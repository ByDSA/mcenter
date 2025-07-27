import z from "zod";
import { stringifyUnknown } from "../../data-types";

const schema = z.object( {
  message: z.string(),
  type: z.string(),
  data: z.any().optional(),
  trace: z.array(z.string()).optional(),
} ).strict();

type ErrorElementResponse = z.infer<typeof schema>;

export function errorToErrorElementResponse(err: unknown): ErrorElementResponse {
  if (!(err instanceof Error)) {
    return {
      message: stringifyUnknown(err),
      type: "unknown",
    };
  }

  const [_, ...stack] = err.stack?.split("\n").map(s => s.trim()) ?? [];

  return {
    message: err.message,
    trace: stack,
    type: typeof err,
  };
}

export {
  schema as errorElementResponseSchema,
  ErrorElementResponse,
};
