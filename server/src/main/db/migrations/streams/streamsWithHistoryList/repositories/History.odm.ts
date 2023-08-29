import { DateSchema } from "#utils/time";
import mongoose from "mongoose";
import HistoryEntryInStream from "../models/HistoryEntryInStream";

/**
 * @deprecated
 */
export const HistoryEntryInStreamSchema = new mongoose.Schema<HistoryEntryInStream>( {
  date: {
    type: DateSchema,
    required: true,
  },
  episodeId: {
    type: String,
    required: true,
  },
} );
