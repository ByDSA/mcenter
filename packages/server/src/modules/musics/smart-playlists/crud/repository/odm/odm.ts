import mongoose, { Schema } from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { OwnerUserPublic } from "#musics/playlists/crud/repository/odm/odm";

export type DocOdm = TimestampsOdm.AutoTimestamps & {
  _id?: mongoose.Types.ObjectId;
  name: string;
  query: string;
  slug: string;
  ownerUserId: UserOdm.FullDoc["_id"];
  visibility: "private" | "public";
  imageCoverId?: mongoose.Types.ObjectId | null;
};

export type FullDocOdm = RequireId<DocOdm> & {
  ownerUser?: UserOdm.FullDoc;
  imageCover?: ImageCoverOdm.FullDoc;
  ownerUserPublic?: OwnerUserPublic;
};

const NAME = "MusicSmartPlaylist";

export const COLLECTION = "music_queries";

export const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    name: {
      type: String,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    imageCoverId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
  } satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>,
  {
    collection: COLLECTION,
    timestamps: true,
  },
);

schemaOdm.index(
  {
    slug: 1,
  },
  {
    unique: true,
  },
);
schemaOdm.index( {
  userId: 1,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
