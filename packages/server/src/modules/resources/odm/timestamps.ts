import mongoose from "mongoose";
import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";

export namespace TimestampsOdm {
  export type DocOdm = TimestampsModel;
  export const schema = new mongoose.Schema<DocOdm>( {
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

  export function toDocOdm(model: TimestampsModel): DocOdm {
    return {
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      addedAt: model.addedAt,
      releasedOn: model.releasedOn,
    };
  }

  export function toModel(docOdm: DocOdm): TimestampsModel {
    return {
      createdAt: docOdm.createdAt,
      updatedAt: docOdm.updatedAt,
      addedAt: docOdm.addedAt,
      releasedOn: docOdm.releasedOn,
    };
  }

  export type AutoTimestamps = {
    createdAt: Date;
    updatedAt: Date;
  };

  export type OmitAutoTimestamps<T> = Omit<T, keyof AutoTimestamps>;
}
