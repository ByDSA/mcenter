import mongoose from "mongoose";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { Music } from "#musics/models";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";

export type DocOdm = Omit<Music, "id" | "slug"> & {
  _id?: mongoose.Types.ObjectId;
  onlyTags?: string[];
  url: string;
};

export type FullDocOdm = RequireId<DocOdm> & {
  fileInfos?: MusicFileInfoOdm.FullDoc[];
};

const NAME = "Music";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  timestamps: {
    type: TimestampsOdm.schema,
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
  weight: {
    type: Number,
    required: true,
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
  lastTimePlayed: {
    type: Number,
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
} satisfies SchemaDef<DocOdm>);

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
