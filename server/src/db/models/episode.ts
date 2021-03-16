import mongoose from "mongoose";

export interface Episode {
    id: string;
    title: string;
    path: string;
    weight: number;
    start: number;
    end: number;
    tags?: string[];
    duration?: number;
}

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    path: {
        type: String,
        required: true,
        unique: true
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

export { schema as EpisodeSchema };
