import { SECS_IN_DAY, SECS_IN_HOUR, daysBetween, secsBetween } from "./units";

export type DateFormat = {
  dateTime: "date" | "datetime" | "fullDate" | "none" | "time";
  ago: "no" | "yes";
};

function getLongDateStr(date: Date, format: DateFormat["dateTime"]) {
  const day = getDD(date);
  const month = getMM(date);
  const year = getYYYY(date);
  const hours = getHH(date);
  const minutes = getMm(date);
  let ret = "";

  if (format === "fullDate")
    ret += `${localeWeekDay(date.getDay())}, `;

  if (format === "date" || format === "datetime" || format === "fullDate")
    ret += `${day} / ${month} / ${year}`;

  if (format === "datetime" || format === "time")
    ret += ` ${hours}:${minutes}`;

  return ret;
}

function getHH(date: Date) {
  return pad2(date.getHours());
}

function getMm(date: Date) {
  return pad2(date.getMinutes());
}

function getDD(date: Date) {
  return pad2(date.getDate());
}

function getMM(date: Date) {
  return pad2(date.getMonth() + 1);
}

function getYYYY(date: Date) {
  return date.getFullYear().toString();
}

export function getSmallDateStr(date: Date) {
  const day = getDD(date);
  const month = getMM(date);
  const year = getYYYY(date);

  return `${day}/${month}/${year}`;
}

export function secsToMmss(secs: number) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  const secondsInt = Math.floor(seconds);
  const secondsDecimal = seconds - secondsInt;

  return `${pad2(minutes)}:${pad2(secondsInt)}${ secondsDecimal ? secondsDecimal.toFixed(2).substring(1) : ""}`;
}

function pad2(n: number | string) {
  return n.toString().padStart(2, "0");
}

export function localeDateAgo(date: Date): string {
  const secsAgo = secsBetween(date);
  const minutesAgo = Math.floor(secsAgo / 60);
  const hoursAgo = Math.floor(secsAgo / SECS_IN_HOUR);
  const minutesMod60Ago = minutesAgo % 60;

  if (secsAgo < SECS_IN_DAY) {
    if (secsAgo < SECS_IN_HOUR)
      return `${pad2(minutesAgo)} ${getLocaleMinutes(minutesAgo)}`;

    return `${pad2(hoursAgo)}:${pad2(minutesMod60Ago)} ${getLocaleHours(2)}`;
  }

  const days = daysBetween(date);
  const diasStr = getLocaleDays(days);

  if (secsAgo < SECS_IN_DAY * 2) {
    const hoursAgoMod24 = hoursAgo % 24;

    return `${days} ${diasStr} y ${hoursAgoMod24} ${getLocaleHours(hoursAgoMod24)}`;
  }

  return `${days} ${diasStr}`;
}

function getLocaleDays(days: number) {
  return days === 1 ? "día" : "días";
}

function getLocaleHours(hours: number) {
  return hours === 1 ? "hora" : "horas";
}

function getLocaleMinutes(minutes: number) {
  return minutes === 1 ? "minuto" : "minutos";
}

export function formatDate(date: Date, {dateTime, ago}: DateFormat) {
  let ret = "";

  if (dateTime !== "none")
    ret += getLongDateStr(date, dateTime);

  if (ago === "yes")
    ret += ` (hace ${localeDateAgo(date)})`;

  return ret;
}

export function localeWeekDay(weekDay: number): string {
  switch (weekDay) {
    case 0:
      return "Domingo";
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miércoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    case 6:
      return "Sábado";
    default:
      throw new Error(`Invalid weekDay: ${weekDay}`);
  }
}