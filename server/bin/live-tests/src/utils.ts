import { Temporal } from "@js-temporal/polyfill";

export function formatDate(date = new Date()) {
  return `${date.getFullYear()}-${padTwoDigitNumber(date.getMonth() + 1)}-${padTwoDigitNumber(date.getDate())} ${padTwoDigitNumber(date.getHours())}:${padTwoDigitNumber(date.getMinutes())}:${padTwoDigitNumber(date.getSeconds())}`;
}

function padTwoDigitNumber(num: number) {
  return num.toString().padStart(2, "0");
}

export function formatTemporal(temporal = Temporal.Now.zonedDateTimeISO()) {
  return `${temporal.year}-${padTwoDigitNumber(temporal.month)}-${padTwoDigitNumber(temporal.day)} ${padTwoDigitNumber(temporal.hour)}:${padTwoDigitNumber(temporal.minute)}:${padTwoDigitNumber(temporal.second)}`;
}