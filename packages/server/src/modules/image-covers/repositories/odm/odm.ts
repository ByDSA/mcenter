import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";

export type DocOdm = TimestampsOdm.AutoTimestamps & {
  _id?: mongoose.Types.ObjectId;
  metadata: {
    label: string;
  };
  versions: {
    original: string;
    large?: string;
    medium?: string;
    small?: string;
  };
  uploaderUserId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "ImageCover";

export const COLLECTION = "image_covers";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  metadata: {
    label: {
      type: String,
      required: true,
    },
  },
  versions: {
    original: {
      type: String,
      required: true,
    },
    small: {
      type: String,
      required: false,
    },
    medium: {
      type: String,
      required: false,
    },
    large: {
      type: String,
      required: false,
    },
  },
  uploaderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  versionKey: false,
  timestamps: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
