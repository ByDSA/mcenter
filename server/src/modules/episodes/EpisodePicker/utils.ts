import { HistoryList } from "#modules/historyLists";
import { Serie } from "#modules/series";
import { Stream } from "#modules/streams";
import { Picker } from "rand-picker";

export type Params<R> = {
  picker: Picker<R>;
  self: R;
  serie: Serie;
  episodes: R[];
  lastEp: R | null;
  stream: Stream;
  historyList: HistoryList;
};