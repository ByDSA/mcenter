import { historyEntryDtoSchema, HistoryEntryDto } from "./history-entry.dto";
import { dtoToHistoryList, historyListDtoSchema, HistoryListDto } from "./history-list.dto";

export const historyDto = {
  list: {
    schema: historyListDtoSchema,
    toModel: dtoToHistoryList,
  },
  entry: {
    schema: historyEntryDtoSchema,
  },
};

export {
  HistoryEntryDto,
  HistoryListDto,
};
