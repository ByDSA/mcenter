import mongoose from "mongoose";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { EpisodeCompKeyOdm } from "#episodes/repositories/odm/odm";

type DocOdm = OptionalId & {
  lastCompKey: EpisodeCompKeyOdm;
  nextCompKey: EpisodeCompKeyOdm;
};

type FullDocOdm = RequireId<DocOdm> & {
  last?: EpisodeOdm.FullDoc;
  next?: EpisodeOdm.FullDoc;
};

const schemaOdm = new mongoose.Schema<DocOdm>( {
  lastCompKey: {
    episodeKey: {
      type: String,
      required: true,
    },
    seriesKey: {
      type: String,
      required: true,
    },
  },
  nextCompKey: {
    episodeKey: {
      type: String,
      required: true,
    },
    seriesKey: {
      type: String,
      required: true,
    },
  },
} satisfies SchemaDef<DocOdm>, {
  collection: "episodeDependencies",
  autoIndex: false,
} );
// Index:
/*
db.getCollection("episodeDependencies").createIndex(
  {
    "lastCompKey.seriesKey": 1,
    "lastCompKey.episodeKey": 1,
  },
  {
    unique: true,
  }
);
*/
const NAME = "EpisodeDependency";
const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export {
  DocOdm,
  schemaOdm,
  ModelOdm,
  FullDocOdm,
};
