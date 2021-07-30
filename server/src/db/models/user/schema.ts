/* eslint-disable no-underscore-dangle */
import { HistoryInterface, HistorySchemaObj } from "@models/history";
import { GroupSchemaObj } from "@models/resources/group/schema";
import { TimestampSchemaObj } from "@models/timestamp";
import { addRefreshUpdateAtOnSave } from "@models/timestamp/schema";
import { Schema } from "mongoose";
import Doc from "./document";
import { compareHash, hash } from "./password";

const sch = HistorySchemaObj || {
  _id: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
  ...TimestampSchemaObj,
  name: String,
  typeResource: String,
  content: [{
    idResource: String,
    date: {
      type: Number,
      default: Date.now,
    },
  }],
};

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
  groups: {
    type: [GroupSchemaObj],
    required: false,
  },
  histories: {
    type: [sch],
    required: false,
  },
};

const schema = new Schema(SchemaObj);

schema.post("init", function (newVal: HistoryInterface[]) {
  const user: Doc = <Doc><unknown> this;

  if (user.histories) {
    const historiesCopy = JSON.parse(JSON.stringify(user.histories));

    (<any> this).oldHistories = historiesCopy;
  }

  return newVal;
} );

schema.pre("save", function f(next) {
  const user: Doc = <Doc> this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("pass"))
    return next();

  user.pass = hash(user.pass);

  return next();
} );

schema.pre("save", function f(next) {
  const user: Doc = <Doc> this;
  const oldHistories: HistoryInterface[] = <HistoryInterface[]>(<any> this).oldHistories;

  if (oldHistories) {
    for (const oldHistory of oldHistories) {
      const newHistory = user.histories?.find((h) => h._id && h._id === oldHistory._id);

      if (newHistory && !deepEqual(newHistory, oldHistory))
        newHistory.updatedAt = +new Date();
    }

    if (user.histories) {
      for (const history of user.histories) {
        const oldHistory = oldHistories.find((h) => h._id && h._id === history._id);

        if (!oldHistory) {
          history.createdAt = +new Date();
          history.updatedAt = history.createdAt;
        }
      }
    }
  }

  return next();
} );

addRefreshUpdateAtOnSave(schema);

schema.methods.comparePassSync = function f(candidatePassword) {
  const user: Doc = <Doc> this;

  return compareHash(candidatePassword, user.pass);
};

export default schema;

function deepEqual(object1: any, object2: any) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length)
    return false;

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);

    if (
      (areObjects && !deepEqual(val1, val2))
      || (!areObjects && val1 !== val2)
    )
      return false;
  }

  return true;
}

function isObject(object: any) {
  return object != null && typeof object === "object";
}
