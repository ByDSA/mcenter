import { ZodType } from "zod";
import { throwErrorPopStack } from "../../errors";

export type AssertZodSettings = {
  msg?: string;
  useZodError?: boolean;
};

export function assertZod<T>(schema: ZodType<T>, model: unknown, settings?: AssertZodSettings): asserts model is T {
  if (settings?.useZodError) {
    schema.parse(model);

    return;
  }

  const result = schema.safeParse(model);

  if (!result.success) {
    const plainErrors = result.error.issues.map((issue) => {
      let ret = issue.message;

      if (issue.path.length > 0)
        ret = `at ${ issue.path.join(".") }: ${ ret}`;

      return ret;
    } );
    const error = new Error(settings?.msg ?? `${plainErrors.join("\n")}\nValue: ${JSON.stringify(model, null, 2)}`);

    throwErrorPopStack(error);
  }
}

export function assertZodPopStack<T>(schema: ZodType<T>, model: unknown, settings?: AssertZodSettings): asserts model is T {
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
