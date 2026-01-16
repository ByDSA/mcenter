import mongoose, { Schema } from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export type EntryDocOdm = {
  _id?: mongoose.Types.ObjectId; // El 'id' de la entrada en la lista
  resourceId: mongoose.Types.ObjectId; // Referencia a Playlist o Query
  type: "playlist" | "query";
};

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  list: EntryDocOdm[];
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "MusicUserList";

export const COLLECTION = "music_users_lists";

const entrySchema = new mongoose.Schema<EntryDocOdm>( {
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: ["playlist", "query"],
    required: true,
  },
} satisfies SchemaDef<EntryDocOdm>);

export const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    list: {
      type: [entrySchema],
      default: [],
    },
  } satisfies SchemaDef<DocOdm>,
  {
    collection: COLLECTION,
    timestamps: false,
  },
);

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
