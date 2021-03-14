import mongoose, { Document } from "mongoose";
import { Episode } from "./episode.model";
import { getDateNow, History, HistoryModel, HistorySchema } from "./history.model";
import { SerieModel } from "./serie.model";

enum Mode {
    SEQUENTIAL = "SEQUENTIAL",
    RANDOM = "RANDOM"
};

interface Stream extends Document {
    id: string;
    group: string;
    mode: Mode.SEQUENTIAL | Mode.RANDOM;
    maxHistorySize: number;
    history: History[];
}

const NAME = "Stream";
const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: [Mode.SEQUENTIAL, Mode.RANDOM],
        required: true
    },
    maxHistorySize: {
        type: Number,
        required: true
    },
    history: {
        type: [HistorySchema]
    }
});

const model = mongoose.model<Stream>(NAME, schema);

export async function getById(id: string): Promise<Stream | null> {
    const streams = await model.find({ id }, { _id: 0 });
    let stream: Stream | undefined | null = streams[0];
    if (!stream) {
        stream = await createFromSerie(id);
    }

    return stream;
}

export async function addToHistory(stream: Stream, episode: Episode) {
    const newEntry: History = await HistoryModel.create({
        date: getDateNow(),
        episodeId: episode.id
    });
    stream.history.push(newEntry);
    const saved = await model.findOneAndUpdate({ id: stream.id }, stream);
}

export async function createFromSerie(serieId: string): Promise<Stream | null> {
    const serie = await SerieModel.find({ id: serieId });
    if (serie && serie.length > 0) {
        const newStream: Stream = new model({
            id: serieId,
            group: `series/${serieId}`,
            mode: Mode.SEQUENTIAL,
            maxHistorySize: 1,
            history: [
            ]
        });
        newStream.save();
        return newStream;
    } else
        return null;
}

export { schema as SteamSchema, Mode, Stream, model as StreamModel };
