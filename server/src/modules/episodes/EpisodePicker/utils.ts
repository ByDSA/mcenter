import HistoryList from "#modules/historyLists/models/HistoryList";
import { Serie } from "#modules/series";
import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import { Picker } from "rand-picker";

export type Params<R> = {
  picker: Picker<R>;
  self: R;
  serie: Serie;
  episodes: R[];
  lastEp: R | null;
  stream: StreamWithHistoryList;
  historyList: HistoryList;
};