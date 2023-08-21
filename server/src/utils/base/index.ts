/* eslint-disable import/prefer-default-export */
type MergeParamsParams<T extends {}> = {
  defaultParams: T;
  inputParams?: T;
};
export function mergeParams<T extends {}>( {defaultParams, inputParams}: MergeParamsParams<T>) {
  const mergedParams = {
    ...defaultParams,
    ...inputParams,
  };

  return mergeDeepObjects(defaultParams, mergedParams);
}

type MergeDeepObject = Record<string, any>;

export function isObject(item: any): boolean {
  return (item && typeof item === "object" && !Array.isArray(item));
}

export function mergeDeepObjects(...sources: (MergeDeepObject | undefined)[]): MergeDeepObject {
  const definedSources = sources.filter((source) => source !== undefined) as MergeDeepObject[];

  return mergeDeepInner( {
  }, ...definedSources);
}

export function mergeDeepSameObjects<T extends MergeDeepObject>(...sources: (T | undefined)[]): T {
  return mergeDeepObjects(...sources) as T;
}

// https://stackoverflow.com/a/34749873
function mergeDeepInner(target: MergeDeepObject, ...sources: MergeDeepObject[]): MergeDeepObject {
  if (!sources.length)
    return target;

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {
            },
          } );
        }

        mergeDeepInner(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key],
        } );
      }
    }
  }

  return mergeDeepInner(target, ...sources);
}