import merge from "./ts-deepmerge";

export default function mergeOpts<T extends {}>(defaultParams: T, inputParams?: Partial<T>): T {
  if (!inputParams)
    return defaultParams;

  const mergedParams = merge.withOptions( {
    mergeArrays: false,
  },defaultParams, inputParams) as T;

  return mergedParams;
}