import { episodeHistoryEntryDtoSchema, EpisodeHistoryEntryDto } from "./history-entry.dto";
import { dtoToEpisodeHistoryList, episodeHistoryListDtoSchema, EpisodeHistoryListDto } from "./history-list.dto";

export const episodeHistoryDto = {
  list: {
    schema: episodeHistoryListDtoSchema,
    toModel: dtoToEpisodeHistoryList,
  },
  entry: {
    schema: episodeHistoryEntryDtoSchema,
  },
};

export {
  EpisodeHistoryEntryDto,
  EpisodeHistoryListDto,
};
