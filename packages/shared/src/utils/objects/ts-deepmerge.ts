/* eslint-disable no-nested-ternary */
// Source: https://github.com/voodoocreation/ts-deepmerge/blob/master/index.ts
// Modificado para que acepte undefined como objeto a mergear
type TAllKeys<T> = T extends any ? keyof T : never;

type TIndexValue<T, K extends PropertyKey, D = never> = T extends any
  ? K extends keyof T
    ? T[K]
    : D
  : never;

type TPartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

type TFunction = (...a: any[])=> any;

type TPrimitives =
  Date | TFunction | bigint | boolean | number | string | symbol;

type TMerged<T> = [T] extends [Array<any>]
  ? { [K in keyof T]: TMerged<T[K]> }
  : [T] extends [TPrimitives]
  ? T
  : [T] extends [object]
  ? TPartialKeys<{ [K in TAllKeys<T>]: TMerged<TIndexValue<T, K>> }, never>
  : T;

// istanbul ignore next
const isObject = (obj: any) => {
  if (typeof obj === "object" && obj !== null) {
    if (typeof Object.getPrototypeOf === "function") {
      const prototype = Object.getPrototypeOf(obj);

      return prototype === Object.prototype || prototype === null;
    }

    return Object.prototype.toString.call(obj) === "[object Object]";
  }

  return false;
};

interface IObject {
  [key: string]: any;
}

export const deepMerge = <T extends IObject>(
  ...objects: (T | undefined)[]
): TMerged<T[][number]> => objects.reduce((result: IObject, current) => {
  if (current === undefined)
    return result;

  if (Array.isArray(current)) {
    throw new TypeError(
      "Arguments provided to ts-deepmerge must be objects, not arrays.",
    );
  }

  Object.keys(current).forEach((key) => {
    if (["__proto__", "constructor", "prototype"].includes(key))
      return;

    if (Array.isArray(result[key]) && Array.isArray(current[key])) {
      result[key] = deepMerge.options.mergeArrays
        ? deepMerge.options.uniqueArrayItems
          ? Array.from(
            new Set((result[key] as unknown[]).concat(current[key])),
          )
          : [...result[key], ...current[key]]
        : current[key];
    } else if (isObject(result[key]) && isObject(current[key]))
      result[key] = deepMerge(result[key] as IObject, current[key] as IObject);
    else {
      result[key] = current[key] === undefined
        ? deepMerge.options.allowUndefinedOverrides
          ? current[key]
          : result[key]
        : current[key];
    }
  } );

  return result;
}, {} ) as any;

interface IOptions {

  /**
   * When `true`, values explicitly provided as `undefined` will override existing values,
   * though properties that are simply omitted won't affect anything.
   * When `false`, values explicitly provided as `undefined` won't override existing values.
   *
   * Default: `true`
   */
  allowUndefinedOverrides: boolean;

  /**
   * When `true` it will merge array properties.
   * When `false` it will replace array properties with the last instance
   * entirely instead of merging their contents.
   *
   * Default: `true`
   */
  mergeArrays: boolean;

  /**
   * When `true` it will ensure there are no duplicate array items.
   * When `false` it will allow duplicates when merging arrays.
   *
   * Default: `true`
   */
  uniqueArrayItems: boolean;
}

const defaultOptions: IOptions = {
  allowUndefinedOverrides: true,
  mergeArrays: true,
  uniqueArrayItems: true,
};

deepMerge.options = defaultOptions;

deepMerge.withOptions = <T extends IObject[]>(
  options: Partial<IOptions>,
  ...objects: T
) => {
  deepMerge.options = {
    ...defaultOptions,
    ...options,
  };

  const result = deepMerge(...objects);

  deepMerge.options = defaultOptions;

  return result;
};
