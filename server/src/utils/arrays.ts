export type ArrayOneOrMore<T> = Array<T> & {
  0: T;
};

export type ArrayTwoOrMore<T> = ArrayOneOrMore<T> & {
  1: T;
};