import mongoose from "mongoose";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";

type DocOdm = OptionalId & {
 lastEpisodeId: mongoose.Types.ObjectId;
  nextEpisodeId: mongoose.Types.ObjectId;
};

type FullDocOdm = RequireId<DocOdm> & {
  last?: EpisodeOdm.FullDoc;
  next?: EpisodeOdm.FullDoc;
};

const NAME = "EpisodeDependency";

export const COLLECTION = "episode_dependencies";
const schemaOdm = new mongoose.Schema<DocOdm>( {
  lastEpisodeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  nextEpisodeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION,
  autoIndex: false,
} );

schemaOdm.index(
  {
    lastEpisodeId: 1,
  },
  {
    unique: true,
  },
);

const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export {
  DocOdm,
  schemaOdm,
  ModelOdm,
  FullDocOdm,
};
