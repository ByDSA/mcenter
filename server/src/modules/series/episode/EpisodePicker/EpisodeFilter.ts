/* eslint-disable import/prefer-default-export */
import HistoryList from "#modules/history/model/HistoryList";
import { SerieWithEpisodes } from "#modules/series/serie";
import { StreamWithHistoryList } from "#modules/streamWithHistoryList";
import { Picker } from "rand-picker";
import { Episode } from "../model";
import { dependent, preventDisabled, preventRepeatInDays, preventRepeatLast, removeWeightLowerOrEqualThan } from "./filters";
import { Params } from "./utils";

const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;

export type MiddlewareFilterFunction = (params: Params<Episode>)=> boolean;
const filterFunctions: MiddlewareFilterFunction[] = [
  dependent,
  preventDisabled,
  preventRepeatLast,
  removeWeightLowerOrEqualThan(+(PICKER_MIN_WEIGHT || -999)),
  preventRepeatInDays(+(PICKER_MIN_DAYS || 0)),
];

export function filter(
  picker: Picker<Episode>,
  serie: SerieWithEpisodes,
  lastEp: Episode | null,
  stream: StreamWithHistoryList,
  historyList: HistoryList,
): void {
  console.log("Filtering...");
  const newData = picker.data.filter((self: Episode) => {
    for (const func of filterFunctions) {
      if (!func( {
        picker,
        self,
        serie,
        lastEp,
        stream,
        historyList,
      } ))
        return false;
    }

    return true;
  } );

  for (let i = 0; i < picker.data.length; i++) {
    const episode = picker.data[i];

    if (!newData.includes(episode)) {
      picker.remove(episode);
      i--;
    }
  }

  if (picker.data.length === 0)
    picker.put(serie.episodes[0]);
}
