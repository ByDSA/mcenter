import mongoose, { Schema, Types } from "mongoose";
import { SeriesKey } from "../../../models";
import { RequireId } from "#utils/layers/db/mongoose";
import { ImageCoverOdm } from "#modules/image-covers/repositories/odm";

export interface DocOdm {
  _id?: Types.ObjectId;
  key: SeriesKey;
  name: string;
  imageCoverId?: Types.ObjectId | null; // TODO: cambiar db por null y ponerlo obligado
}

export type FullDocOdm = RequireId<DocOdm> & {
  imageCover?: ImageCoverOdm.FullDoc;
};

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
  imageCoverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // TODO: cambiar db por null y ponerlo obligado y quitar default
    default: null,
  },
}, {
  collection: COLLECTION,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schema);
