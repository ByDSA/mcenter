import { getDateStr as getLongDateStr } from "../utils";

export function dateInLastestComponent(date: Date) {
  const days = getDaysSince(date);
  const diasStr = days === 1 ? "día" : "días";

  return `${getLongDateStr(date)} (hace ${getDaysSince(date)} ${diasStr})`;
}

export function getSmallDateStr(date: Date) {
  const day = date.getDate().toString()
    .padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
}

export function getDaysSince(date: Date) {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function secsToMS(secs: number) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  const secondsInt = Math.floor(seconds);
  const secondsDecimal = seconds - secondsInt;

  return `${minutes.toString().padStart(2, "0")}:${secondsInt.toString().padStart(2,"0")}${ secondsDecimal ? secondsDecimal.toFixed(2).substring(1) : ""}`;
}