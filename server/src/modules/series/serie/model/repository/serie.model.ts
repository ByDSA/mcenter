import { EpisodeDB, EpisodeSchemaDB } from "#modules/series/episode/db";
import mongoose, { Schema } from "mongoose";
import { SerieId } from "../Serie";

interface SerieDB {
  id: SerieId;
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
const model = mongoose.model<SerieDB>(NAME, schema);

export {
  SerieDB, model as SerieModel, schema as SerieSchema,
};
