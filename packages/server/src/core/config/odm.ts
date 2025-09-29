import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  configName: string;
  appName: string;
  mails: {
    disabled?: boolean;
    supportEmail?: string;
    verification: {
      tokenExpirationTime: number; // seconds
      minMailInterval: number; // seconds
      maxCount: number;
    };
  };
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "Config";
const COLLECTION_NAME = "configs";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  appName: {
    type: String,
    required: true,
    default: "MCenter",
  },
  configName: {
    type: String,
    required: true,
    unique: true,
    default: "default",
  },
  mails: {
    disabled: {
      type: Boolean,
      required: false,
    },
    supportEmail: {
      type: String,
      required: false,
    },
    verification: {
      tokenExpirationTime: {
        type: Number,
        required: true,
        default: 60 * 60,
      },
      minMailInterval: {
        type: Number,
        required: true,
        default: 1 * 60,
      },
      maxCount: {
        type: Number,
        required: true,
        default: 3,
      },
    },
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
