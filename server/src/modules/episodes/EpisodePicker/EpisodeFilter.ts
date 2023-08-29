/* eslint-disable import/prefer-default-export */
import { HistoryList } from "#modules/historyLists";
import { Serie } from "#modules/series";
import { Stream } from "#modules/streams";
import { Picker } from "rand-picker";
import { Model } from "../models";
import { dependent, preventDisabled, preventRepeatInDays, preventRepeatLast, removeWeightLowerOrEqualThan } from "./filters";
import { Params } from "./utils";

const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;

export type MiddlewareFilterFunction = (params: Params<Model>)=> boolean;
const filterFunctions: MiddlewareFilterFunction[] = [
  dependent,
  preventDisabled,
  preventRepeatLast,
  removeWeightLowerOrEqualThan(+(PICKER_MIN_WEIGHT || -999)),
  preventRepeatInDays(+(PICKER_MIN_DAYS || 0)),
];

export function filter(
  picker: Picker<Model>,
  serie: Serie,
  episodes: Model[],
  lastEp: Model | null,
  stream: Stream,
  historyList: HistoryList,
): void {
  console.log("Filtering...");
  const newData = picker.data.filter((self: Model) => {
    for (const func of filterFunctions) {
      if (!func( {
        picker,
        self,
        serie,
        episodes,
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
    picker.put(episodes[0]);
}
