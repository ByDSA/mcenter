import mongoose, { Schema, Types } from "mongoose";
import { DateType } from "$shared/utils/time";
import { DateTypeOdmSchema } from "#utils/time";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { StreamOdm } from "#episodes/streams/crud/repository/odm";
import { UserOdm } from "#core/auth/users/crud/repository/odm";

type DocOdm = {
  _id?: Types.ObjectId;
  date: DateType;
  episodeId: Types.ObjectId;
  streamId: Types.ObjectId;
  userId: UserOdm.FullDoc["_id"];
};

type FullDocOdm = RequireId<DocOdm> & {
  episode?: EpisodeOdm.FullDoc;
  stream?: StreamOdm.FullDoc;
  user?: UserOdm.FullDoc;
};

export const COLLECTION = "episode_history_entries";

const schemaOdm = new mongoose.Schema<DocOdm>( {
  date: {
    type: DateTypeOdmSchema,
    required: true,
  },
  episodeId: {
    type: Schema.ObjectId,
    required: true,
  },
  streamId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION,
} );
const NAME = "EpisodeHistoryEntry";
const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export {
  DocOdm,
  schemaOdm,
  ModelOdm,
  FullDocOdm,
};
