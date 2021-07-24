import { Schema } from "mongoose";

// eslint-disable-next-line import/prefer-default-export
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
  deletedAt: {
    type: Number,
    required: false,
  },
};

export function addRefreshUpdateAtOnSave(schema: Schema): void {
  schema.pre("save", function f(next) {
    const user: any = <any> this;

    if (!user.isModified())
      return next();

    user.updatedAt = +new Date();

    return next();
  } );
}
