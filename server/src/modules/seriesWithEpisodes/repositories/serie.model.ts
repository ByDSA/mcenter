import { EpisodeDocODM, EpisodeSchema } from "#modules/episodes/repositories";
import mongoose, { Schema } from "mongoose";
import { ModelId } from "../../series/models/Serie";

interface DocODM {
  id: ModelId;
  name: string;
  episodes: EpisodeDocODM[];
}

const NAME = "Serie";
const schema = new Schema<DocODM>( {
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
const model = mongoose.model<DocODM>(NAME, schema);

export {
  DocODM, model as ModelODM, schema,
};
