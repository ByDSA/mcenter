import mongoose, { Schema } from "mongoose";
import { SerieId } from "../../models";

export interface DocOdm {
  id: SerieId;
  name: string;
}

const NAME = "series";

export const schema = new Schema<DocOdm>( {
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
}, {
  collection: NAME,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schema);
