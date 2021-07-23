export const RESOURCE = {
  url: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
};

export const LOCAL_RESOURCE = {
  ...RESOURCE,
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
};

export const MULTIMEDIA_LOCAL_RESOURCE = {
  ...LOCAL_RESOURCE,
  weight: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  tags: {
    type: [String],
  },
  disabled: {
    type: Boolean,
  },
};
