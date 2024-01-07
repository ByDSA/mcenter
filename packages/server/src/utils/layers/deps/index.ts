import { PublicMethodsOf } from "#shared/utils/types";
import { InjectionToken, container } from "tsyringe";
// eslint-disable-next-line import/no-internal-modules
import { DelayedConstructor } from "tsyringe/dist/typings/lazy-helpers";
// eslint-disable-next-line import/no-internal-modules
import { constructor } from "tsyringe/dist/typings/types";

export type DepsMapType = Record<string, constructor<any> | DelayedConstructor<any>>;

export type DepsFromMap<T extends DepsMapType> = {
  [K in keyof T]: PublicMethodsOf<T[K] extends constructor<infer R> ? R : T[K] extends DelayedConstructor<infer R> ? R : never>;
};

function resolveDeps<T, M extends DepsMapType>(depsMap: M, deps?: Partial<T>): DepsFromMap<M> {
  const ret: DepsFromMap<M> = {
    ...deps,
  } as DepsFromMap<M>;

  // eslint-disable-next-line no-restricted-syntax
  for (const key in depsMap) {
    if (typeof key === "string" && !ret[key]) {
      ret[key] = container.resolve(depsMap[key]);

      if (ret[key] === undefined)
        throw new Error(`Could not resolve dependency ${key}`);
    }
  }

  return ret;
}

export function injectDeps(map: DepsMapType) {
  return function f<T extends { new (...args: any[]): {} }>(clazz: T) {
    return class extends clazz {
      constructor(...args: any[]) {
        const deps = args[0];
        const newDeps = resolveDeps(map, deps);

        super(newDeps);
      }
    };
  };
}

export function resolveRequired<T>(token: InjectionToken<T>): PublicMethodsOf<T> {
  if (container.isRegistered(token))
    return container.resolve(token);

  throw new Error(`Could not resolve dependency ${token.toString()}`);
}