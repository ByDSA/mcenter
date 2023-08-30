import { DateTypeOdmSchema } from "#utils/time";
import mongoose from "mongoose";
import HistoryEntryInStream from "../models/HistoryEntryInStream";

/**
 * @deprecated
 */
export const HistoryEntryInStreamSchema = new mongoose.Schema<HistoryEntryInStream>( {
  date: {
    type: DateTypeOdmSchema,
    required: true,
  },
  episodeId: {
    type: String,
    required: true,
  },
} );
