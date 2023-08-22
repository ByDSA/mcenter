import mongoose from "mongoose";
import Interface from "./Episode.interface";

const schema = new mongoose.Schema<Interface>( {
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
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
  lastTimePlayed: {
    type: Number,
  },
}, {
  _id: false,
  autoIndex: false,
} );

export default schema;
