import mongoose, { Document, Schema } from "mongoose";
import { Episode, EpisodeSchema } from "./episode.model";

interface Serie extends Document {
    id: string;
    name: string;
    episodes: Episode[];
}

const NAME = "Serie";
const schema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    episodes: {
        type: [EpisodeSchema]
    }
});

const model = mongoose.model<Serie>(NAME, schema);

export async function getFromGroupId(groupId: string): Promise<Serie | null> {
    const groupSplit = groupId.split("/");
    const serieId = groupSplit[groupSplit.length - 1];

    const [serie] = await model.find({ id: serieId });
    if (!serie)
        return null;
    return serie;
}

export { schema as SerieSchema, model as SerieModel, Serie };
