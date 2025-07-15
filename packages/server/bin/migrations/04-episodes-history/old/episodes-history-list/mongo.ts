import mongoose from "mongoose";
import { DateType } from "$shared/utils/time";
import { DateTypeOdmSchema } from "./deps";
import { EpisodeHistoryListEntity } from "./deps";

type EntryDocOdm = {
  date: DateType;
  episodeId: string;
  serieId: string;
};

export const entrySchema = new mongoose.Schema<EntryDocOdm>( {
  date: {
    type: DateTypeOdmSchema,
    required: true,
  },
  episodeId: {
    type: String,
    required: true,
  },
  serieId: {
    type: String,
    required: true,
  },
} );

type DocOdm = Omit<EpisodeHistoryListEntity, "entries"> & {
  entries: EntryDocOdm[];
};

const NAME = "HistoryList";
const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    id: {
      type: String,
      required: true,
    },
    entries: {
      type: [entrySchema],
      required: true,
    },
    maxSize: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "historyLists",
  },
);
const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export {
  DocOdm,
  schemaOdm,
  EntryDocOdm,
  ModelOdm,
};
