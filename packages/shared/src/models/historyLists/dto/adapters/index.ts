import { episodeDtoToModel } from "../../../episodes";
import Model from "../../HistoryList";

export function dtoToModel(dto: Model): Model {
  return {
    id: dto.id,
    entries: dto.entries.map(entryDtoToModel),
    maxSize: dto.maxSize,
  };
}

export function entryDtoToModel(dto: Model["entries"][0]): Model["entries"][0] {
  return {
    ...dto,
    episode: dto.episode ? episodeDtoToModel(dto.episode) : undefined,
  };
}