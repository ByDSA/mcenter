import { DateSchema } from "#utils/time";
import mongoose from "mongoose";

const schema = new mongoose.Schema( {
  date: {
    type: DateSchema,
    required: true,
  },
  episodeId: {
    type: String,
    required: true,
  },
} );

export default schema;
