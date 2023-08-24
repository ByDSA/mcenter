type PickMatching<T, V> =
    { [K in keyof T as T[K] extends V ? K : never]: T[K] };

export type PublicMethodsOf<T> = PickMatching<T, Function>;