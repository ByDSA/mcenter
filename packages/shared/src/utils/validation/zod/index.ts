import z, { ZodType, ZodTypeAny } from "zod";
import { throwErrorPopStack } from "../../errors";

export type AssertZodSettings = {
  msg?: string;
  useZodError?: boolean;
};

export class CustomValidationError extends Error {
  static fromZodError(error: z.ZodError, model: unknown, msg?: string): CustomValidationError {
    const plainErrors = error.issues.map((issue) => {
      let ret = issue.message;

      if (issue.path.length > 0)
        ret = `at ${ issue.path.join(".") }: ${ ret}`;

      return ret;
    } );
    const finalMsg = msg ?? plainErrors.join("\n");

    return new CustomValidationError(model, finalMsg);
  }

  constructor(model: unknown, msg: string) {
    const finalMsg = `${msg}\nValue: ${JSON.stringify(model, null, 2)}`;

    super(finalMsg);
    this.name = "CustomValidationError";
  }
}

export function assertZod<T extends ZodTypeAny>(
  schema: T,
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is z.output<T> {
  parseZod(schema, model, settings);
}

export function parseZod<T extends ZodTypeAny>(
  schema: T,
  model: unknown,
  settings?: AssertZodSettings,
): z.output<T> {
  if (settings?.useZodError) {
    schema.parse(model);

    return;
  }

  const result = schema.safeParse(model);

  if (!result.success) {
    const error = CustomValidationError.fromZodError(result.error, model, settings?.msg);

    throwErrorPopStack(error);
  }

  return result.data;
}

export function genParseZod<T>(
  schema: ZodType<T>,
  settings?: AssertZodSettings,
) {
  return (model: unknown): T => parseZodPopStack(schema, model, settings);
}

export function genAssertZod<T>(
  schema: ZodType<T>,
  settings?: AssertZodSettings,
) {
  return (model: unknown): asserts model is T => assertZodPopStack(schema, model, settings);
}

export function parseZodPopStack<T>(
  schema: ZodType<T>,
  model: unknown,
  settings?: AssertZodSettings,
): T {
  // Porque el double mounting de React a veces da en el primer mount
  // un schema inválido
  // eslint-disable-next-line no-underscore-dangle
  if ("_cached" in schema && !schema._cached)
    return model as T;

  try {
    return parseZod(schema, model, settings);
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e, 2);

    throw e;
  }
}

export function assertZodPopStack<T>(
  schema: ZodType<T>,
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is T {
  try {
    return assertZod(schema, model, settings);
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e, 2);

    throw e;
  }
}

export {
  PropInfo,
  schemaToReadableFormat as zodSchemaToReadableFormat,
} from "./utils";

export * from "./refinements";
