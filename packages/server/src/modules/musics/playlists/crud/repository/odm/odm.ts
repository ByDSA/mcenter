import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { MusicOdm } from "#musics/crud/repositories/music/odm";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { isTest } from "#utils";

type EntryDocOdm = {
  _id: mongoose.Types.ObjectId;
  musicId: mongoose.Types.ObjectId;
  addedAt: Date;
};
type EntryFullDocOdm = RequireId<EntryDocOdm> & {
  music?: MusicOdm.FullDoc;
};

const entrySchemaOdm = new mongoose.Schema<EntryDocOdm>( {
  musicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  addedAt: {
    type: Date,
    required: true,
  },
} satisfies SchemaDef<EntryDocOdm>, {
  _id: true,
} );

export type DocOdm = TimestampsOdm.AutoTimestamps & {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  userId: UserOdm.FullDoc["_id"];
  list: EntryDocOdm[];
};

export type FullDocOdm = Omit<RequireId<DocOdm>, "list"> & {
  user?: UserOdm.FullDoc;
  list: EntryFullDocOdm[];
};

const NAME = "MusicPlaylist";

export const COLLECTION = "music_playlists";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  list: {
    type: [entrySchemaOdm],
    required: true,
    default: [],
  },
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  timestamps: true,
  autoIndex: isTest(),
} );

schemaOdm.index( {
  slug: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
