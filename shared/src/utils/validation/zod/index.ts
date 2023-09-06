import { ZodType } from "zod";
import { throwErrorPopStack } from "../../errors";

export function assertZod<T>(schema: ZodType<T>, model: unknown, msg?: string): asserts model is T {
  const result = schema.safeParse(model);

  if (!result.success) {
    const plainErrors = result.error.issues.map((issue) => {
      let ret = issue.message;

      if (issue.path.length > 0)
        ret = `at ${ issue.path.join(".") }: ${ ret}`;

      return ret;
    } );
    const error = new Error(msg ?? `${plainErrors.join("\n")}\nValue: ${JSON.stringify(model, null, 2)}`);

    throwErrorPopStack(error);
  }
}

export function assertZodPopStack<T>(schema: ZodType<T>, model: unknown, msg?: string): asserts model is T {
  try {
    return assertZod(schema, model, msg);
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e, 2);

    throw e;
  }
}