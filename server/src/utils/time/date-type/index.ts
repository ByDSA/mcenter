import { DateType } from "#shared/utils/time";
import mongoose from "mongoose";

const schemaOdm = new mongoose.Schema<DateType>( {
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
  },
} );

export {
  schemaOdm as DateTypeOdmSchema,
};
