/* eslint-disable import/prefer-default-export */
import { HistoryInterface } from "@models/history";
import { HistoryItem } from "@models/history/interface";
import { ItemGroup } from "@models/resources/group/interface";
import { daysBetween } from "date-ops";
import { DateTime } from "luxon";

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
