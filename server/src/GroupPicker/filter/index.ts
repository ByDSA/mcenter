/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-cycle */
import { daysBetween } from "date-ops";
import { DateTime } from "luxon";
import { Schema } from "mongoose";
import { Picker } from "rand-picker";
import { GroupInterface } from "../../db/models/group";
import { ItemGroup } from "../../db/models/group/interface";
import { HistoryInterface } from "../../db/models/history";
import { HistoryItem } from "../../db/models/history/interface";
import { getLastItemFromHistory, Params } from "../GroupPicker";

const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;

type MiddlewareFilterFunction = (params: Params)=> boolean;
const filterFunctions: MiddlewareFilterFunction[] = [
  dependent,
  preventDisabled,
  preventRepeatLast,
  removeWeightLowerOrEqualThan(+(PICKER_MIN_WEIGHT || -999)),
  preventRepeatInDays(+(PICKER_MIN_DAYS || 0)),
];

export default function filter(
  picker: Picker<ItemGroup>,
  group: GroupInterface,
  history: HistoryInterface,
): void {
  console.log("Filtering...");
  const newData = picker.data.filter((self: ItemGroup) => {
    for (const func of filterFunctions) {
      if (!func( {
        picker,
        self,
        group,
        history,
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

  if (picker.data.length === 0) {
    const first = (<ItemGroup[]>group.content)[0];

    picker.put(first);
  }
}

function preventRepeatLast( { self, history }: Params) {
  const lastItem = getLastItemFromHistory(history);

  return !lastItem || lastItem.idResource !== self.id;
}

type Obj = {
  [key: string]: [string, string][];
};

function dependent( { self, history, group }: Params) {
  let ret = true;
  const obj: Obj = {
    simpsons: [
      ["6x23", "6x24"],
    ],
    fguy: [
      ["6x04", "6x05"],
      ["4x28", "6x29"],
      ["4x29", "6x30"],
      ["12x06", "12x07"],
      ["12x07", "12x08"],
    ],
  }; // TODO: pasar a db dentro de group
  const dependencies = <Schema.Types.ObjectId[][]><any>obj[group.url];
  const lastId = getLastItemFromHistory(history).idResource;

  for (const d of dependencies)
    ret &&= dependency(lastId, d, self);

  return ret;
}

function dependency(
  lastId: Schema.Types.ObjectId,
  [mapFirst, mapSecond]: Schema.Types.ObjectId[],
  self: ItemGroup,
): boolean {
  return (lastId === mapFirst && self.id === mapSecond)
  || (lastId !== mapFirst && self.id !== mapSecond);
}

function preventDisabled( { self }: Params) {
  // const resource = await getResourceFromItem(self);
  // const ret = resource.disabled === undefined || resource.disabled === false;
  const ret = !!self;

  return ret;
}

function removeWeightLowerOrEqualThan(num: number) {
  return ( { self }: Params): boolean => (self.weight ?? 1) > num;
}

function preventRepeatInDays(minDays: number) {
  return ( { self, history }: Params): boolean => {
    const daysFromLastTime = getDaysFrom(self, history);

    return daysFromLastTime >= minDays;
  };
}

export function getDaysFrom(self: ItemGroup, history: HistoryInterface): number {
  let days = Number.MAX_SAFE_INTEGER;
  const now = DateTime.now();
  const content = <HistoryItem[]>history.content;

  for (const h of content) {
    if (h.idResource === self.id) {
      const date = getDateFromTimestampInSec(+h.date);
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
