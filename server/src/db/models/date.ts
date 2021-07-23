import mongoose from "mongoose";

export interface DateType {
    year: number;
    month: number;
    day: number;
    timestamp: number;
}

const schema = new mongoose.Schema( {
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

export function getDateTypeNow(): DateType {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    year,
    month,
    day,
    timestamp,
  };
}

export {
  schema as DateSchema,
};
