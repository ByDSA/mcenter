import mongoose, { Schema, Types } from "mongoose";
import { OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { ImageCoverOdm } from "#modules/image-covers/repositories/odm";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { SeriesKey } from "../../../models";

export type DocOdm = OptionalId & TimestampsOdm.AutoTimestamps & TimestampsOdm.NonAutoTimestamps & {
  key: SeriesKey;
  name: string;
  imageCoverId: Types.ObjectId | null;
};

export type FullDocOdm = RequireId<DocOdm> & {
  imageCover?: ImageCoverOdm.FullDoc;
  countEpisodes?: number;
  countSeasons?: number;
};

const NAME = "Serie";

export const COLLECTION = "series";

export const schema = new Schema<DocOdm>( {
  key: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  imageCoverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // TODO: cambiar db por null y ponerlo obligado y quitar default
    default: null,
  },
  ...TimestampsOdm.nonAutoTimestampsSchemaDefinition,
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  timestamps: true,
} );

schema.index( {
  key: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schema);
