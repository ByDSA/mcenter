import mongoose, { Schema } from "mongoose";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  timestamps: TimestampsOdm.DocOdm;
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
};

const NAME = "Music";

export const COLLECTION = "musics";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  timestamps: {
    type: TimestampsOdm.schema,
    required: true,
  },
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
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION,
  versionKey: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
