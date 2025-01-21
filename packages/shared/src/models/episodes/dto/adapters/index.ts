/* eslint-disable no-param-reassign */
import { Entity as Model } from "../../Entity";

export function episodeDtoToModel(dto: Model): Model {
  return {
    ...dto,
    fileInfo: dto.fileInfo,
    timestamps: {
      createdAt: new Date(dto.timestamps.createdAt),
      updatedAt: new Date(dto.timestamps.updatedAt),
      addedAt: new Date(dto.timestamps.addedAt),
    },
  };
}