import mongoose, { Types } from "mongoose";
import { DateType } from "$shared/utils/time";
import { DateTypeOdmSchema } from "#utils/time";
import { SerieFullDocOdm } from "#series/repositories/odm";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { RequireId } from "#utils/layers/db/mongoose";

type DocOdm = {
  _id?: Types.ObjectId;
  date: DateType;
  episodeId: {
    code: string;
    serieId: string;
  };
};

type FullDocOdm = RequireId<DocOdm> & {
  serie?: SerieFullDocOdm;
  episode?: EpisodeOdm.FullDoc;
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
  FullDocOdm,
};
