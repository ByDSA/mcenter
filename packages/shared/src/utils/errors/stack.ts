import { assertIsDefined } from "../validation";

const SEPARATOR = "\n    at ";

export function throwErrorPopStack(error: Error, stackLevels = 1): never {
  errorPopStack(error, stackLevels);

  throw error;
}

export function errorPopStack(error: Error, stackLevels = 1): Error {
  return errorSliceStack(error, 1, stackLevels);
}

export function errorSliceStack(error: Error, stackStartLevel: number, length = 1): Error {
  assertIsDefined(error.stack);
  const stackArray = error.stack.split(SEPARATOR);

  stackArray.splice(stackStartLevel, length);

  // Si no se muta el error, la instancia nueva no es del mismo tipo que la original y da problemas
  error.stack = `${stackArray.join(SEPARATOR)}`;

  return error;
}
