/* eslint-disable import/prefer-default-export */
export function neverCase(value: never): never {
  const never: never = value;

  throw new Error(`Unknown value: ${never}`);
}