import { episodeDtoToModel } from "../../../episodes/dto";
import { HistoryList } from "../../HistoryList";

export function dtoToModel(dto: HistoryList): HistoryList {
  return {
    id: dto.id,
    entries: dto.entries.map(entryDtoToModel),
    maxSize: dto.maxSize,
  };
}

export function entryDtoToModel(dto: HistoryList["entries"][0]): HistoryList["entries"][0] {
  return {
    ...dto,
    episode: dto.episode ? episodeDtoToModel(dto.episode) : undefined,
  };
}
