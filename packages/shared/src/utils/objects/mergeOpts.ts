import { deepMerge } from "./ts-deepmerge";

export function mergeOpts<T extends object>(defaultParams: T, inputParams?: Partial<T>): T {
  if (!inputParams)
    return defaultParams;

  const mergedParams = deepMerge.withOptions( {
    mergeArrays: false,
  }, defaultParams, inputParams) as T;

  return mergedParams;
}
