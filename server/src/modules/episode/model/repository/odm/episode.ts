/* eslint-disable import/prefer-default-export */
import mongoose from "mongoose";

const schema = new mongoose.Schema( {
  id: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
  },
  weight: {
    type: Number,
  },
  start: {
    type: Number,
  },
  end: {
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
} );

export {
  schema as EpisodeSchema,
};
