import mongoose from "mongoose";
import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";

type DocOdm = TimestampsModel;
export const timestampsSchemaOdm = new mongoose.Schema<DocOdm>( {
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  addedAt: {
    type: Date,
    required: false,
  },
  releasedOn: {
    type: String,
    required: false,
  },
} );

export function timestampsModelToDocOdm(model: TimestampsModel): DocOdm {
  return {
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    addedAt: model.addedAt,
  };
}

export function timestampsDocOdmToModel(docOdm: DocOdm): TimestampsModel {
  return {
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    addedAt: docOdm.addedAt,
  };
}
