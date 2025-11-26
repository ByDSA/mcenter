import mongoose, { Schema } from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";

export type DocOdm = TimestampsOdm.AutoTimestamps & TimestampsOdm.NonAutoTimestamps & {
  _id?: mongoose.Types.ObjectId;
  title: string;
  artist: string;
  album?: string;
  tags?: string[];
  onlyTags?: string[];
  url: string;
  game?: string;
  year?: number;
  spotifyId?: string;
  disabled?: boolean;
  country?: string;
  uploaderUserId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm> & {
  fileInfos?: MusicFileInfoOdm.FullDoc[];
  userInfo?: MusicsUsersOdm.FullDoc;
  isFav?: boolean;
};

const NAME = "Music";

export const COLLECTION = "musics";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  uploaderUserId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  spotifyId: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
  },
  tags: {
    type: [String],
    required: false,
    default: undefined,
  },
  onlyTags: {
    type: [String],
    required: false,
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
  game: {
    type: String,
  },
  country: {
    type: String,
  },
  year: {
    type: Number,
  },
  ...TimestampsOdm.nonAutoTimestampsSchemaDefinition,
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  versionKey: false,
  timestamps: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
