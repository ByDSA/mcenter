export type ArrayOneOrMore<T> = Array<T> & {
  0: T;
};

export type ArrayTwoOrMore<T> = ArrayOneOrMore<T> & {
  1: T;
};

export async function asyncFilter<T>(
  arr: readonly T[],
  predicate: (value: T)=> Promise<any>,
): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

// eslint-disable-next-line require-await
export async function asyncMap<T, U>(
  arr: readonly T[],
  predicate: (value: T)=> Promise<U>,
): Promise<U[]> {
  return Promise.all(arr.map(predicate));
}

export function removeNulls<T>(array: (T | null)[]): asserts array is T[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === null) {
      array.splice(i, 1);
      i--;
    }
  }
}
