import { Schema } from "mongoose";
import { TimestampSchemaObj } from "../timestamp";
import { addRefreshUpdateAtOnSave } from "../timestamp/schema";

export const ContentItemSchemaObj = {
  idResource: String,
  date: {
    type: Number,
    default: Date.now,
  },
};

const schemaContentItem = new Schema(ContentItemSchemaObj);

export const SchemaObj = {
  _id: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  },
  ...TimestampSchemaObj,
  name: String,
  typeResource: String,
  content: [ContentItemSchemaObj],
};

const schema = new Schema(SchemaObj);

addRefreshUpdateAtOnSave(schema);

export default schema;

export {
  schemaContentItem,
};
