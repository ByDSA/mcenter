import mongoose from "mongoose";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { isTest } from "#utils";
import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { EpisodesUsersOdm } from "../../user-infos/odm";

export type DocOdm = OptionalId & TimestampsOdm.AutoTimestamps &
  TimestampsOdm.NonAutoTimestamps & {
  episodeKey: string;
  seriesId: mongoose.Types.ObjectId;
  title: string;
  tags?: string[];
  disabled?: boolean;
  uploaderUserId: mongoose.Types.ObjectId;
  imageCoverId?: mongoose.Types.ObjectId | null;
  count?: number;
};

export type FullDocOdm = RequireId<DocOdm> & {
  series?: SeriesOdm.FullDoc;
  fileInfos?: EpisodeFileInfoOdm.FullDoc[];
  userInfo?: EpisodesUsersOdm.FullDoc;
  imageCover?: ImageCoverOdm.FullDoc;
};

const NAME = "Episode";

export const COLLECTION = "episodes";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  episodeKey: {
    type: String,
    required: true,
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  uploaderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
  imageCoverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  count: {
    type: Number,
    required: false,
  },
  ...TimestampsOdm.nonAutoTimestampsSchemaDefinition,
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  autoIndex: isTest(),
  versionKey: false,
  timestamps: true,
} );

schemaOdm.index( {
  seriesId: 1,
  episodeKey: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
