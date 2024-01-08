import { MusicID } from "#shared/models/musics";
import { DateType } from "#shared/utils/time";
import { DateTypeOdmSchema } from "#utils/time";
import mongoose from "mongoose";

export type DocOdm = {
  date: DateType;
  musicId: MusicID;
};

const NAME = "MusicHistory";

export const Schema = new mongoose.Schema<DocOdm>( {
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
  collection: "musicHistory",
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, Schema);