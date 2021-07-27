import { TimestampSchemaObj } from "../timestamp";

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
    required: false,
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
};

export const LocalResourceFileSchemaObj = {
  ...ResourceSchemaObj,
  hash: {
    type: String,
    required: true,
    unique: true,
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
  weight: {
    type: Number,
  },
  duration: {
    type: Number,
  },
};
