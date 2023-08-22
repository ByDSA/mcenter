import HistoryList from "#modules/historyLists/models/HistoryList";
import { SerieWithEpisodes } from "#modules/seriesWithEpisodes";
import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import { Picker } from "rand-picker";

export type Params<R> = {
  picker: Picker<R>;
  self: R;
  serie: SerieWithEpisodes;
  lastEp: R | null;
  stream: StreamWithHistoryList;
  historyList: HistoryList;
};