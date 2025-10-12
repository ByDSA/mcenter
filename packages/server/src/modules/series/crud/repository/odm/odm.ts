import mongoose, { Schema, Types } from "mongoose";
import { RequireId } from "#utils/layers/db/mongoose";
import { SeriesKey } from "../../../models";

export interface DocOdm {
  _id?: Types.ObjectId;
  key: SeriesKey;
  name: string;
}

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "Serie";

export const COLLECTION = "series";

export const schema = new Schema<DocOdm>( {
  key: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
}, {
  collection: COLLECTION,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schema);
