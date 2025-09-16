import mongoose from "mongoose";
import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { MusicOdm } from "#musics/crud/repository/odm";

type EntryDocOdm = {
  _id: mongoose.Types.ObjectId;
  musicId: mongoose.Types.ObjectId;
};
type EntryFullDocOdm = RequireId<EntryDocOdm> & {
  music?: MusicOdm.FullDoc;
};

const entrySchemaOdm = new mongoose.Schema<EntryDocOdm>( {
  musicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
} satisfies SchemaDef<EntryDocOdm>, {
  _id: true,
} );

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  userId: mongoose.Types.ObjectId;
  list: EntryDocOdm[];
  timestamps: TimestampsModel;
};

export type FullDocOdm = Omit<RequireId<DocOdm>, "list"> & {
  user?: unknown; // TODO: cambiar cuando haya users
  list: EntryFullDocOdm[];
};

const NAME = "MusicPlaylist";
const COLLECTION_NAME = "musicPlaylists";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  timestamps: {
    type: TimestampsOdm.schema,
    required: true,
  },
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
  },
  list: {
    type: [entrySchemaOdm],
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
  _id: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
