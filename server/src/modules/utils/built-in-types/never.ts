import { throwErrorPopStack } from "../others";

/* eslint-disable import/prefer-default-export */
export function neverCase(value: never): never {
  const never: never = value;

  throwErrorPopStack(new Error(`Unknown value: ${never}`));
}