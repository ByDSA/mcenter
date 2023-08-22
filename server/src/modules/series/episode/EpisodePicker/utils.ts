import HistoryList from "#modules/history/model/HistoryList";
import { SerieWithEpisodes } from "#modules/series/serie";
import { StreamWithHistoryList } from "#modules/streamWithHistoryList";
import { Picker } from "rand-picker";

export type Params<R> = {
  picker: Picker<R>;
  self: R;
  serie: SerieWithEpisodes;
  lastEp: R | null;
  stream: StreamWithHistoryList;
  historyList: HistoryList;
};