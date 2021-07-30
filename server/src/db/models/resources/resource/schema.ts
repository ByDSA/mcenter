import { TimestampSchemaObj } from "@models/timestamp";

export const ResourceSchemaObj = {
  ...TimestampSchemaObj,
  url: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  tags: {
    type: [String],
    default: undefined,
  },
  disabled: Boolean,
};

export const LocalResourceFileSchemaObj = {
  ...ResourceSchemaObj,
  hash: {
    type: String,
    required: true,
  },
};

export const LocalResourceSchemaObj = {
  ...ResourceSchemaObj,
  path: {
    type: String,
    required: true,
    unique: true,
  },
};

export const MultimediaLocalResourceSchemaObj = {
  ...LocalResourceSchemaObj,
  ...LocalResourceFileSchemaObj,
  duration: Number,
};
