import mongoose from "mongoose";
import z from "zod";

export type EpisodeHistoryListEntity = {
    entries: {
        date: {
            year: number;
            month: number;
            day: number;
            timestamp: number;
        };
        episodeId: {
            innerId: string;
            serieId: string;
        };
    }[];
    id: string;
    maxSize: number;
}

export const dateTypeSchema = z.object( {
  year: z.number().min(1970),
  month: z.number()
    .min(1)
    .max(12),
  day: z.number()
    .min(1)
    .max(31),
  timestamp: z.number()
    .min(0),
} ).strict();

export type DateType = z.infer<typeof dateTypeSchema>;

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