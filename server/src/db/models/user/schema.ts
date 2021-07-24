import { Schema } from "mongoose";
import { TimestampSchemaObj } from "../timestamp";
import { addRefreshUpdateAtOnSave } from "../timestamp/schema";
import Doc from "./document";
import { compareHash, hash } from "./password";

export const SchemaObj = {
  ...TimestampSchemaObj,
  name: {
    type: String,
  },
  pass: {
    type: String,
  },
  role: {
    type: String,
  },
};

const schema = new Schema(SchemaObj);

schema.pre("save", function f(next) {
  const user: Doc = <Doc> this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("pass"))
    return next();

  user.pass = hash(user.pass);

  return next();
} );

addRefreshUpdateAtOnSave(schema);

schema.methods.comparePassSync = function f(candidatePassword) {
  const user: Doc = <Doc> this;

  return compareHash(candidatePassword, user.pass);
};

export default schema;
