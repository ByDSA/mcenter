import { assertIsDefined } from "#utils/checking";

export type TestVOParams<T> = {
  fActual: ()=> T;
  expected: T;
};

export type ResendErrorLessStackOptions = {
  levels?: number;
};
const SEPARATOR = "\n    at ";
const defaultOptions = {
  levels: 1,
};

export function throwErrorPopStack(error: Error, options?: ResendErrorLessStackOptions): never {
  const actualOptions = {
    ...defaultOptions,
    ...options,
  };
  const {levels} = actualOptions;

  errorPopStack(error, levels);

  throw error;
}

export function errorPopStack(error: Error, n = 1): Error {
  assertIsDefined(error.stack);
  const stackArray = error.stack.split(SEPARATOR);

  stackArray.splice(1, n);

  // Si no se muta el error, la instancia nueva no es del mismo tipo que la original y da problemas
  // eslint-disable-next-line no-param-reassign
  error.stack = `${stackArray.join(SEPARATOR)}`;

  return error;
}

export function rethrowErrorLessStackOptionsAddLevel(options: ResendErrorLessStackOptions, n = 1) {
  return {
    ...defaultOptions,
    ...options,
    levels: (options?.levels ?? defaultOptions.levels) + n,
  };
}