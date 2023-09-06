import { HistoryList } from "#modules/historyLists";
import { Serie } from "#modules/series";
import { Stream, StreamMode } from "#modules/streams";
import { neverCase } from "#shared/utils/validation";
import { Model } from "../models";
import EpisodePicker from "./EpisodePicker";
import RandomPicker from "./EpisodePickerRandom";
import SequentialPicker from "./EpisodePickerSequential";

type Params = {
  episodes: Model[];
  lastEp?: Model;
  mode: StreamMode;
  serie: Serie;
  stream: Stream;
  historyList: HistoryList;
};
export default function buildEpisodePicker( { mode, episodes, lastEp, historyList, serie, stream }: Params): EpisodePicker {
  let picker: EpisodePicker;

  switch (mode) {
    case StreamMode.SEQUENTIAL:
      picker = new SequentialPicker( {
        episodes,
        lastEp,
      } );
      break;
    case StreamMode.RANDOM:
      picker = new RandomPicker( {
        episodes,
        lastEp,
        historyList,
        serie,
        stream,
      } );
      break;
    default:
      neverCase(mode);
  }

  return picker;
}