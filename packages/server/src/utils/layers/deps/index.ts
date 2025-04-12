import { PublicMethodsOf } from "#shared/utils/types";
import { InjectionToken, container } from "tsyringe";
import { DelayedConstructor } from "tsyringe/dist/typings/lazy-helpers";
import { constructor } from "tsyringe/dist/typings/types";

export type DEPS_MAPType = Record<string, constructor<any> | DelayedConstructor<any>>;

export type DepsFromMap<T extends DEPS_MAPType> = {
  [K in keyof T]: PublicMethodsOf<T[K] extends constructor<infer R>
  ? R : T[K] extends DelayedConstructor<infer R> ? R : never>;
};

function resolveDeps<T, M extends DEPS_MAPType>(DEPS_MAP: M, deps?: Partial<T>): DepsFromMap<M> {
  const ret: DepsFromMap<M> = {
    ...deps,
  } as DepsFromMap<M>;

  // eslint-disable-next-line no-restricted-syntax
  for (const key in DEPS_MAP) {
    if (typeof key === "string" && !ret[key]) {
      ret[key] = container.resolve(DEPS_MAP[key]);

      if (ret[key] === undefined)
        throw new Error(`Could not resolve dependency ${key}`);
    }
  }

  return ret;
}

export function injectDeps(map: DEPS_MAPType) {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  return function f<T extends { new(...args: any[]): {} }>(clazz: T) {
    return class extends clazz {
      constructor(...args: any[]) {
        // eslint-disable-next-line prefer-destructuring
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
