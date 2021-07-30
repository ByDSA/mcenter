import { TimestampSchemaObj } from "@models/timestamp";
import { addRefreshUpdateAtOnSave } from "@models/timestamp/schema";
import { Schema } from "mongoose";

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
