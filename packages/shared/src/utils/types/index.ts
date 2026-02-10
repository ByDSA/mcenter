export type AllKeysOf<T> = Record<keyof T, any>;

type PropsXORTwo<T, U> = (T & { [K in keyof U]?: never } )
  | (U & { [K in keyof T]?: never } );

export type PropsXOR<A, B, C = never, D = never, E = never> =
  [C] extends [never]
    ? PropsXORTwo<A, B>
    : [D] extends [never]
      ? PropsXORTwo<A, PropsXORTwo<B, C>>
      : [E] extends [never]
        ? PropsXORTwo<A, PropsXORTwo<B, PropsXORTwo<C, D>>>
        : PropsXORTwo<A, PropsXORTwo<B, PropsXORTwo<C, PropsXORTwo<D, E>>>>;
