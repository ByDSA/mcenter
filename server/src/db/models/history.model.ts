import mongoose, { Document } from "mongoose";

interface History extends Document {
    date: Date;
    episodeId: string;
}

interface Date {
    year: number;
    month: number;
    day: number;
    timestamp: number;
}

const NAME = "History";
const dateSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    day: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Number
    }
});
const schema = new mongoose.Schema({
    date: {
        type: dateSchema,
        required: true
    },
    episodeId: {
        type: String,
        required: true
    }
});

export function getDateNow(): Date {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const timestamp = Math.floor(Date.now() / 1000);

    return {
        year,
        month,
        day,
        timestamp
    }
}

const model = mongoose.model<History>(NAME, schema);
export { schema as HistorySchema, History, model as HistoryModel, Date };
