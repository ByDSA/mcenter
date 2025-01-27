import { throwErrorPopStack } from "../errors";

export function neverCase(value: never): never {
  const never: never = value;

  throwErrorPopStack(new Error(`Unknown value: ${never}`));
}
