import { EpisodeDB, EpisodeSchemaDB } from "#modules/series/episode/db";
import mongoose, { Document, Schema } from "mongoose";

interface SerieDocument extends Document {
  id: string;
  name: string;
  episodes: EpisodeDB[];
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
    type: [EpisodeSchemaDB],
  },
} );
const model = mongoose.model<SerieDocument>(NAME, schema);

export {
  SerieDocument as SerieDB, model as SerieModel, schema as SerieSchema,
};
