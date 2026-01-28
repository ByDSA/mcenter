import mongoose from "mongoose";
import { EpisodeCompKey } from "../../../../models";
import { EpisodesUsersOdm } from "../../user-infos/odm";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { MongoFilterQuery, OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { ImageCoverOdm } from "#modules/image-covers/repositories/odm";

export type EpisodeCompKeyOdm = {
  episodeKey: string;
  seriesKey: string;
};

export type DocOdm = EpisodeCompKeyOdm & OptionalId & TimestampsOdm.AutoTimestamps &
  TimestampsOdm.NonAutoTimestamps & {
  title: string;
  tags?: string[];
  disabled?: boolean;
  uploaderUserId: mongoose.Types.ObjectId;
  imageCoverId?: mongoose.Types.ObjectId | null;
};

export type FullDocOdm = RequireId<DocOdm> & {
  serie?: SeriesOdm.FullDoc;
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
  seriesKey: {
    type: String,
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
  ...TimestampsOdm.nonAutoTimestampsSchemaDefinition,
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  autoIndex: false,
  versionKey: false,
  timestamps: true,
} );

schemaOdm.index( {
  episodeKey: 1,
  seriesKey: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export async function getIdOdmFromCompKey(compKey: EpisodeCompKey) {
  const filter = {
    seriesKey: compKey.seriesKey,
    episodeKey: compKey.episodeKey,
  } satisfies MongoFilterQuery<DocOdm>;
  const episodeOdm = await ModelOdm.findOne(filter);

  if (!episodeOdm)
    return null;

  const id = episodeOdm.toObject()._id as mongoose.Types.ObjectId;

  return id;
}
