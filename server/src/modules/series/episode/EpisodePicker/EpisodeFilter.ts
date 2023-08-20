/* eslint-disable import/prefer-default-export */
import { SerieWithEpisodes } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { Resource } from "#modules/utils/base/resource";
import { Picker } from "rand-picker";
import { dependent, preventDisabled, preventRepeatInDays, preventRepeatLast, removeWeightLowerOrEqualThan } from "./filters";
import { Params } from "./utils";

const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;

type MiddlewareFilterFunction = (params: Params<Resource>)=> boolean;
const filterFunctions: MiddlewareFilterFunction[] = [
  dependent,
  preventDisabled,
  preventRepeatLast,
  removeWeightLowerOrEqualThan(+(PICKER_MIN_WEIGHT || -999)),
  preventRepeatInDays(+(PICKER_MIN_DAYS || 0)),
];

export function filter(
  picker: Picker<Resource>,
  serie: SerieWithEpisodes,
  lastEp: Resource | null,
  stream: Stream,
): void {
  console.log("Filtering...");
  const newData = picker.data.filter((self: Resource) => {
    for (const func of filterFunctions) {
      if (!func( {
        picker,
        self,
        serie,
        lastEp,
        stream,
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
