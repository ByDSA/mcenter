import mongoose from "mongoose";
import { DateType } from "$shared/utils/time";
import { MusicId } from "#musics/models";
import { DateTypeOdmSchema } from "#utils/time";
import { RequireId } from "#utils/layers/db/mongoose";
import { MusicOdm } from "#modules/musics/rest/repository/odm";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  date: DateType;
  musicId: MusicId;
};

export type FullDocOdm = RequireId<DocOdm> & {
  music?: MusicOdm.FullDoc;
};

const NAME = "MusicHistory";

export const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    date: {
      type: DateTypeOdmSchema,
      required: true,
    },
    musicId: {
      type: String,
      required: true,
    },
  },
  {
    collection: "musicHistoryEntries",
  },
);

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
