import { EpisodeSchema } from "#modules/series/episode/db";
import mongoose, { Document, Schema } from "mongoose";
import Serie from "../serie.entity";

interface SerieDocument extends Document, Serie {
  id: string;
}

const NAME = "Serie";
const schema = new Schema( {
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  episodes: {
    type: [EpisodeSchema],
  },
} );
const model = mongoose.model<SerieDocument>(NAME, schema);

export {
  SerieDocument as Serie, model as SerieModel, schema as SerieSchema,
};
