import { SECONDS_IN_DAY } from "..";

export function genLastTimePlayedDaysAgo(days: number) {
  return Date.now() / 1000 - (days * SECONDS_IN_DAY);
}