import { daysBetween } from "date-ops";
import { DateTime } from "luxon";
import { Picker } from "rand-picker";
import { History } from "#modules/history";
import { Serie } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { Resource } from "#modules/utils/base/resource";
import { DateType } from "#modules/utils/time/date-type";
import { Episode } from "../model";
import { dependent, preventDisabled, preventRepeatInDays, preventRepeatLast, removeWeightLowerOrEqualThan } from "./filters";
import { Params } from "./utils";

const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;

type MiddlewareFilterFunction = (params: Params)=> boolean;
const filterFunctions: MiddlewareFilterFunction[] = [
  dependent,
  preventDisabled,
  preventRepeatLast,
  removeWeightLowerOrEqualThan(+(PICKER_MIN_WEIGHT || -999)),
  preventRepeatInDays(+(PICKER_MIN_DAYS || 0)),
];

export function filter(
  picker: Picker<Resource>,
  serie: Serie,
  lastEp: Resource | null,
  stream: Stream,
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

export function getDaysFromLastInHistory(self: Episode, history: History[]): number {
  let days = Number.MAX_SAFE_INTEGER;
  const now = DateTime.now();

  for (const h of history) {
    if (self && h.episodeId === self.id) {
      let date;

      if (h.date.timestamp)
        date = getDateFromTimestampInSec(+h.date.timestamp);
      else
        date = getDateFromYearMonthDayHistory(h.date);

      const d = daysBetween(date, now);

      if (d < days)
        days = d;
    }
  }

  return days;
}

function getDateFromTimestampInSec(timestamp: number): DateTime {
  const date = new Date();

  date.setTime(timestamp * 1000);

  return DateTime.fromJSDate(date);
}

function getDateFromYearMonthDayHistory(dateIn: DateType) {
  const { year } = dateIn;
  const month = dateIn.month - 1;
  const { day } = dateIn;
  const date = new Date(year, month, day);

  return DateTime.fromJSDate(date);
}
