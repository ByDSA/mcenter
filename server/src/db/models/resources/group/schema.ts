import { Schema } from "mongoose";
import { ResourceSchemaObj } from "../resource/schema";

const ContentItemSchemaObj = {
  id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  url: String,
  weight: Number,
  type: {
    type: Schema.Types.Mixed,
    required: true,
  },
};

export const GroupSchemaObj = {
  ...ResourceSchemaObj,
  type: {
    type: String,
    required: true,
  },
  content: [ContentItemSchemaObj],
  visibility: {
    type: String,
    required: true,
  },
};

export default new Schema(GroupSchemaObj);
