import { throwErrorPopStack } from "../others";

export type ArrayOneOrMore<T> = Array<T> & {
  0: T;
};

export type ArrayTwoOrMore<T> = ArrayOneOrMore<T> & {
  1: T;
};

export function assertNotEmpty<T>(array: T[]): asserts array is ArrayOneOrMore<T> {
  if (array.length === 0)
    throwErrorPopStack(new Error("Array is empty"));
}