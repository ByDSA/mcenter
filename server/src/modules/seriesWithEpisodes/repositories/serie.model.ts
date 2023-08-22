import { EpisodeDB, EpisodeSchemaDB } from "#modules/episodes/repositories";
import mongoose, { Schema } from "mongoose";
import { ModelId } from "../../series/models/Serie";

interface DocumentODM {
  id: ModelId;
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
const model = mongoose.model<DocumentODM>(NAME, schema);

export {
  DocumentODM, model as ModelODM, schema as SerieSchema,
};
