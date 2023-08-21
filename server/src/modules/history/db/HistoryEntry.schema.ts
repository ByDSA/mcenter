import { DateSchema } from "#modules/utils/time/date-type";
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
