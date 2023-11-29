type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };

export type PublicMethodsOf<T> = PickMatching<T, Function>;

export type ExcludeByPropType<T, U> = Pick<T, {
  [K in keyof T]: T[K] extends U ? never : K;
}[keyof T]>;

export type OptionalProps<T> = ExcludeByPropType<{
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? T[K] : never;
}, never>;

export type NonEmptyObject<T> = keyof T extends never ? never : T;

export type OptionalPropsRecursive<T> = ExcludeByPropType<{
  [K in keyof T]-?: T[K] extends object
    ? NonEmptyObject<OptionalPropsRecursive<T[K]>>
    : {} extends { [P in K]: T[K] }
  ? T[K]
  : never;
}, never>;

export type PartialRecursive<T> = {
  [K in keyof T]?: T[K] extends object ? PartialRecursive<T[K]> : Partial<T[K]>;
};