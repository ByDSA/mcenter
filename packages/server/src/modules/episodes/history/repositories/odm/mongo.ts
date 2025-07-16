import mongoose, { Types } from "mongoose";
import { DateType } from "$shared/utils/time";
import { DateTypeOdmSchema } from "#utils/time";
import { SerieDocOdm } from "#series/repositories/odm";
import { EpisodeDocOdm } from "#episodes/repositories";

type DocOdm = {
  _id: Types.ObjectId;
  date: DateType;
  episodeId: {
    code: string;
    serieId: string;
  };
};

type ExpandedDocOdm = DocOdm & {
  serie?: SerieDocOdm;
  episode?: EpisodeDocOdm;
};

const schemaOdm = new mongoose.Schema<DocOdm>( {
  date: {
    type: DateTypeOdmSchema,
    required: true,
  },
  episodeId: {
    code: {
      type: String,
      required: true,
    },
    serieId: {
      type: String,
      required: true,
    },
  },
}, {
  collection: "episodeHistoryEntries",
} );
const NAME = "EpisodeHistoryEntry";
const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export {
  DocOdm,
  schemaOdm,
  ModelOdm,
  ExpandedDocOdm,
};
