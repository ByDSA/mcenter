/* eslint-disable import/prefer-default-export */
import mongoose from "mongoose";
import { DateSchema } from "#modules/utils/time/date-type";

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

export {
  schema as HistorySchema,
};
