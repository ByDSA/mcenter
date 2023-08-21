import mongoose from "mongoose";
import { DateSchema } from "src/utils/time/date-type";

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
