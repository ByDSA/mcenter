import z from "zod";
import { stringifyUnknown } from "../../data-types";

const schema = z.object( {
  message: z.string(),
  type: z.string(),
  data: z.any().optional(),
  trace: z.array(z.string()).optional(),
} ).strict();

type ErrorElementResponse = z.infer<typeof schema>;

type Options = {
  type?: string;
  ignoreTrace?: boolean;
};
export function errorToErrorElementResponse(err: unknown, options?: Options): ErrorElementResponse {
  if (!(err instanceof Error)) {
    return {
      message: stringifyUnknown(err),
      type: "unknown",
    };
  }

  const [_, ...stack] = err.stack?.split("\n").map(s => s.trim()) ?? [];
  let message: string;
  let type: string = options?.type ?? err.name;

  try {
    message = JSON.parse(err.message);
  } catch {
    message = err.message;
  }

  return {
    message,
    trace: options?.ignoreTrace ? undefined : stack,
    type,
  };
}

export {
  schema as errorElementResponseSchema,
  ErrorElementResponse,
};
