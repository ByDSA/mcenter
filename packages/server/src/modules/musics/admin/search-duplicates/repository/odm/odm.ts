import type { SchemaDef } from "#utils/layers/db/mongoose";
import mongoose, { ObjectId, Types } from "mongoose";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  group: ObjectId[];
};

const NAME = "musicDuplicatesIgnoreGroups";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  group: {
    type: [Types.ObjectId],
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: NAME,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
