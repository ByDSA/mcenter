import mongoose, { Document } from "mongoose";

interface Episode extends Document {
    id: string;
    title: string;
    path: string;
    weight: number;
    start: number;
    end: number;
    tags?: string[];
    duration?: number;
}

const NAME = "Episode";
const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    weight: {
        type: Number
    },
    start: {
        type: Number
    },
    end: {
        type: Number
    },
    duration: {
        type: Number
    },
    tags: {
        type: [String]
    }
});

const model = mongoose.model<Episode>(NAME, schema);
export { schema as EpisodeSchema, Episode, model as EpisodeModel };
