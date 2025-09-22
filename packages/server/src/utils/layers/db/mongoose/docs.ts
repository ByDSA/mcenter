import { WithRequired } from "$shared/utils/objects";
import { Schema, SchemaTypeOptions, Types } from "mongoose";

export type OptionalId = {
  _id?: Types.ObjectId;
};

export type RequireId<T extends OptionalId> = WithRequired<T, "_id">;

export type SchemaDef<T> = {
  [K in keyof Omit<T, "_id">]-?: T[K] extends Date | Types.ObjectId
    ? SchemaTypeOptions<T[K]>
    : T[K] extends (infer U)[]
    ? {
        type: [any] | [Schema<U>];
        required?: boolean;
        default?: T[K];
        [key: string]: any;
      }
    : T[K] extends object
    ? SchemaDef<T[K]> | {
        type: Schema<T[K]> | any;
        required?: boolean;
        default?: T[K];
        [key: string]: any;
      }
    : SchemaTypeOptions<T[K]>;
};
