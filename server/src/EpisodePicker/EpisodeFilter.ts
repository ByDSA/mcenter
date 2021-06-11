/* eslint-disable import/no-cycle */
import { daysBetween } from "date-ops";
import { DateTime } from "luxon";
import { Picker } from "rand-picker";
import { DateType } from "../db/models/date";
import { Episode } from "../db/models/episode";
import { History } from "../db/models/history";
import { Serie } from "../db/models/serie.model";
import { Stream } from "../db/models/stream.model";
import { Params } from "./EpisodePicker";

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
  picker: Picker<Episode>,
  serie: Serie,
  lastEp: Episode | null,
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

function preventRepeatLast( { self, lastEp }: Params) {
  return !lastEp || lastEp.id !== self.id;
}

type Obj = {
  [key: string]: [string, string][];
}

function dependent( { self, lastEp, serie }: Params) {
  let ret = true;
  const obj: Obj = {
    simpsons: [
      ["6x23", "6x24"],
    ],
    fguy: [
      ["6x04", "6x05"],
      ["4x28", "4x29"],
      ["4x29", "4x30"],
      ["12x06", "12x07"],
      ["12x07", "12x08"],
    ],
  };
  const dependencies = obj[serie.id] || [];

  for (const d of dependencies)
    ret &&= dependency(lastEp, d[0], self, d[1]);

  return ret;
}

function dependency(
  lastEp: Episode | null,
  idLast: string,
  self: Episode,
  idCurrent: string,
): boolean {
  return (lastEp?.id === idLast && self.id === idCurrent)
  || (lastEp?.id !== idLast && self.id !== idCurrent);
}

function preventDisabled( { self }: Params) {
  const ret = self.disabled === undefined || self.disabled === false;

  return ret;
}

function removeWeightLowerOrEqualThan(num: number) {
  return ( { self }: Params): boolean => self.weight > num;
}

function preventRepeatInDays(minDays: number) {
  return ( { self, stream }: Params): boolean => {
    const daysFromLastTime = getDaysFrom(self, stream.history);

    return daysFromLastTime >= minDays;
  };
}

export function getDaysFrom(self: Episode, history: History[]): number {
  let days = Number.MAX_SAFE_INTEGER;
  const now = DateTime.now();

  for (const h of history) {
    if (h.episodeId === self.id) {
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
