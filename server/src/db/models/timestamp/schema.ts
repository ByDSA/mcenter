import { Document, Schema } from "mongoose";

export const SchemaObj = {
  updatedAt: {
    type: Number,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Number,
    required: true,
    default: Date.now,
  },
};

export function addRefreshUpdateAtOnSave<D extends Document>(schema: Schema<D>): void {
  schema.pre("save", function f(next) {
    const user: any = <any> this;

    if (!user.isModified())
      return next();

    user.updatedAt = +new Date();

    return next();
  } );
}
