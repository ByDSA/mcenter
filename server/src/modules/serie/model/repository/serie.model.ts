/* eslint-disable require-await */
/* eslint-disable no-await-in-loop */
import mongoose, { Document, Schema } from "mongoose";
import { EpisodeSchema } from "#modules/episode/model/repository/odm/episode";
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
  schema as SerieSchema, model as SerieModel, SerieDocument as Serie,
};
