import mongoose, { Schema } from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { isTest } from "#utils";
import { MovieFileInfoOdm } from "#modules/movies/file-info/crud/repository/odm";

// Document shape (mirrors DB)
export type DocOdm = TimestampsOdm.AutoTimestamps & TimestampsOdm.NonAutoTimestamps & {
  _id?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  year?: number;
  genre: string[];
  director?: string;
  synopsis?: string;
  duration?: number;
  imageCoverId?: mongoose.Types.ObjectId;
  uploaderUserId: mongoose.Types.ObjectId;
  disabled?: boolean;
  tags?: string[];
};

export type FullDocOdm = RequireId<DocOdm> & {
  imageCover?: ImageCoverOdm.FullDoc;
  fileInfos?: MovieFileInfoOdm.FullDoc[];
};

const COLLECTION = "movies";
const NAME = "Movie";

export const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    uploaderUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: false,
    },
    genre: {
      type: [String],
      required: true,
      default: [],
    },
    director: {
      type: String,
      required: false,
    },
    synopsis: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    imageCoverId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
    tags: {
      type: [String],
      required: false,
      default: undefined,
    },
    ...TimestampsOdm.nonAutoTimestampsSchemaDefinition,
  } satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>,
  {
    collection: COLLECTION,
    autoIndex: isTest(),
    versionKey: false,
    timestamps: true,
  },
);

export const ModelOdm = mongoose.model<FullDocOdm>(NAME, schemaOdm);
