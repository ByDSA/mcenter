import mongoose, { Schema, Types } from "mongoose";
import { DateType } from "$shared/utils/time";
import { DateTypeOdmSchema } from "#utils/time";
import { SeriesOdm } from "#series/repositories/odm";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { StreamOdm } from "#modules/streams/repositories/odm";

type DocOdm = {
  _id?: Types.ObjectId;
  date: DateType;
  episodeId: {
    code: string;
    serieId: string;
  };
  streamId: Types.ObjectId;
};

type FullDocOdm = RequireId<DocOdm> & {
  serie?: SeriesOdm.FullDoc;
  episode?: EpisodeOdm.FullDoc;
  stream?: StreamOdm.FullDoc;
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
  streamId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
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
