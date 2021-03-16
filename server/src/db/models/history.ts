import mongoose from "mongoose";
import { DateSchema, DateType as DateType } from "./date";

export interface History {
    date: DateType;
    episodeId: string;
}

const schema = new mongoose.Schema({
    date: {
        type: DateSchema,
        required: true
    },
    episodeId: {
        type: String,
        required: true
    }
});

export { schema as HistorySchema };

