// Versión con control de profundidad para evitar recursión infinita
type Prev = [never, 0, 1, 2, 3, 4, 5];

type DeepKeys<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends Record<string, any>
  ? {
      [K in keyof T]-?: K extends string
        ? T[K] extends Record<string, any>
          ? T[K] extends ArrayLike<any>
            ? K
            : K | `${K}.${DeepKeys<T[K], Prev[D]>}`
          : K
        : never;
    }[keyof T]
  : never;

type MongoSortKeys<T> = DeepKeys<T>;

export type MongoFilterQuery<T> = {
  [K in MongoSortKeys<T>]?: any;
};
type UpdateQueryKeys = "$addToSet" | "$bit" | "$currentDate" | "$inc" | "$max" | "$min" | "$pull" |
  "$push" | "$rename" | "$set" | "$setOnInsert" | "$unset";
export type MongoUpdateQuery<T> = {
  [K in MongoSortKeys<T> | UpdateQueryKeys]?: any;
};

export type MongoSortQuery<T> = {
  [K in MongoSortKeys<T>]?: -1 | 1;
};
