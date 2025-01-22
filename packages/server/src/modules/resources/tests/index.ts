import { SECONDS_IN_DAY } from "..";

export function genLastTimePlayedDaysAgo(days: number) {
  return genLastTimePlayedAgo(days * SECONDS_IN_DAY);
}

export function genLastTimePlayedAgo(seconds: number = 0) {
  return Math.floor(Date.now() / 1000) - seconds;
}
