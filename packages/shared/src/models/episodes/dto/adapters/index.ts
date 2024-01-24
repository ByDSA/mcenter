/* eslint-disable no-param-reassign */
import { Entity as Model } from "../../Entity";

export function dtoToModel(dto: Model): Model {
  return {
    ...dto,
    fileInfo: fileInfoDtoToModel(dto.fileInfo),
  };
}

function fileInfoDtoToModel(dto: Model["fileInfo"]): Model["fileInfo"] {
  if (dto?.timestamps.createdAt)
    dto.timestamps.createdAt = new Date(dto.timestamps.createdAt);

  if (dto?.timestamps.updatedAt)
    dto.timestamps.updatedAt = new Date(dto.timestamps.updatedAt);

  return dto;
}