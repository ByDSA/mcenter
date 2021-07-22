import mongoose from "mongoose";

export default new mongoose.Schema( {
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  weight: {
    type: Number,
  },
  title: {
    type: String,
  },
  artist: {
    type: String,
  },
  album: {
    type: String,
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
} );
