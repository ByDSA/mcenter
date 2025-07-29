import mongoose, { Schema, Types } from "mongoose";
import { SeriesKey } from "../../models";

export interface DocOdm {
  _id?: Types.ObjectId;
  key: SeriesKey;
  name: string;
}

export type FullDocOdm = DocOdm & Required<Pick<DocOdm, "_id">>;

const NAME = "series";

export const schema = new Schema<DocOdm>( {
  key: {
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
