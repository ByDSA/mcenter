/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/no-internal-modules
import { TimestampsModel } from "#shared/models/utils/dtos/Timestamps";
import mongoose from "mongoose";

type DocOdm = TimestampsModel;
export const TimestampsSchemaOdm = new mongoose.Schema<DocOdm>( {
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