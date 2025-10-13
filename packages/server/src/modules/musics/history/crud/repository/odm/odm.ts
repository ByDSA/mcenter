import mongoose, { Schema } from "mongoose";
import { DateType } from "$shared/utils/time";
import { DateTypeOdmSchema } from "#utils/time";
import { RequireId } from "#utils/layers/db/mongoose";
import { MusicOdm } from "#musics/crud/repository/odm";
import { UserOdm } from "#core/auth/users/crud/repository/odm";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  date: DateType;
  musicId: MusicOdm.FullDoc["_id"];
  userId: UserOdm.FullDoc["_id"];
};

export type FullDocOdm = RequireId<DocOdm> & {
  music?: MusicOdm.FullDoc;
  user?: UserOdm.FullDoc;
};

const NAME = "MusicHistory";

export const COLLECTION = "music_history_entries";

export const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    date: {
      type: DateTypeOdmSchema,
      required: true,
    },
    musicId: {
      type: Schema.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.ObjectId,
      required: true,
    },
  },
  {
    collection: COLLECTION,
  },
);

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
