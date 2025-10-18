import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";

export namespace TimestampsOdm {
  export type DocOdm = TimestampsModel;
  export const autoTimestampsSchemaDefinition = {
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: false,
    },
  };
  export const nonAutoTimestampsSchemaDefinition = {
    addedAt: {
      type: Date,
      required: true,
    },
    releasedOn: {
      type: String,
      required: false,
    },
  };

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

  export type NonAutoTimestamps = {
    addedAt: Date;
    releasedOn?: string;
  };

  export type OmitAutoTimestamps<T> = Omit<T, keyof AutoTimestamps>;
}
