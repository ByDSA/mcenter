import { dateDiffRound, calculateDateDifference, DateDiff } from "$shared/utils/time/date-diff";

export type DateFormat = {
  dateTime: "date" | "datetime" | "fullDate" | "none" | "time";
  ago: "no" | "yes";
};

export function secsToMmss(secs: number) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - (minutes * 60);
  const secondsInt = Math.round(seconds);

  return `${pad2(minutes)}:${pad2(secondsInt)}`;
}

export function getLongDateStr(date: Date, format: DateFormat["dateTime"]) {
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

export function pad2(n: number | string) {
  return n.toString().padStart(2, "0");
}

export function localeDateDiff(dateDiff: DateDiff): string {
  if (dateDiff.years >= 1) {
    dateDiffRound(dateDiff, {
      months: {
        ticks: 1,
      },
    } );
    let { years, months } = dateDiff;

    if (months > 3 && months < 9)
      return `${getLocaleNumberYears(years)} ${getLocaleYears(years)} y medio`;

    if (months >= 9) {
      const nextYear = years + 1;

      return `casi ${getLocaleNumberYears(nextYear)} ${getLocaleYears(nextYear)}`;
    }

    if (months > 0)
      return `más de ${getLocaleNumberYears(years)} ${getLocaleYears(years)}`;

    return `${getLocaleNumberYears(years)} ${getLocaleYears(years)}`;
  }

  if (dateDiff.months >= 1) {
    dateDiffRound(dateDiff, {
      months: {
        ticks: 1,
      },
    } );
    let { months, years } = dateDiff;

    if (years > 0)
      return localeDateDiff(dateDiff);

    if (months === 6)
      return `medio ${getLocaleYears(1)}`;

    return `${getLocaleNumberMonths(months)} ${getLocaleMonths(months)}`;
  }

  if (dateDiff.days >= 1) {
    dateDiffRound(dateDiff, {
      days: {
        ticks: 1,
      },
    } );
    let { days, months } = dateDiff;

    if (months > 0)
      return localeDateDiff(dateDiff);

    if (days >= 25)
      return `casi ${getLocaleNumberMonths(1)} ${getLocaleMonths(1)}`;

    if (days >= 7) {
      const weeks = Math.round(days / 7);

      return `${getLocaleNumberWeeks(weeks)} ${getLocaleWeeks(weeks)}`;
    }

    return `${getLocaleNumberDays(days)} ${getLocaleDays(days)}`;
  }

  if (dateDiff.hours >= 1) {
    dateDiffRound(dateDiff, {
      hours: {
        ticks: 1,
      },
    } );
    let { hours, days } = dateDiff;

    if (days > 0)
      return localeDateDiff(dateDiff);

    return `${getLocaleNumberHours(hours)} ${getLocaleHours(hours)}`;
  }

  if (dateDiff.minutes >= 1) {
    dateDiffRound(dateDiff, {
      minutes: {
        ticks: 1,
      },
    } );
    let { minutes, hours } = dateDiff;

    if (hours > 0)
      return localeDateDiff(dateDiff);

    return `${getLocaleNumberMinutes(minutes)} ${getLocaleMinutes(minutes)}`;
  }

  return `menos de ${getLocaleNumberMinutes(1)} ${getLocaleMinutes(1)}`;
}

export function localeDateAgo(date: Date, now = new Date()): string {
  const diffDate = calculateDateDifference(date, now);

  return localeDateDiff(diffDate);
}

// --- Helpers de idioma ---
function getLocaleDays(days: number) {
  return days === 1 ? "día" : "días";
}
function getLocaleNumberDays(n: number): string {
  return n === 1 ? "un" : n.toString();
}
function getLocaleWeeks(days: number) {
  return days === 1 ? "semana" : "semanas";
}
function getLocaleNumberWeeks(n: number): string {
  return n === 1 ? "una" : n.toString();
}
function getLocaleMonths(n: number) {
  return n === 1 ? "mes" : "meses";
}
function getLocaleNumberMonths(n: number): string {
  return n === 1 ? "un" : n.toString();
}
function getLocaleYears(n: number) {
  return n === 1 ? "año" : "años";
}
function getLocaleNumberYears(n: number): string {
  return n === 1 ? "un" : n.toString();
}
function getLocaleHours(hours: number) {
  return hours === 1 ? "hora" : "horas";
}
function getLocaleNumberHours(n: number): string {
  return n === 1 ? "una" : n.toString();
}
function getLocaleMinutes(minutes: number) {
  return minutes === 1 ? "minuto" : "minutos";
}
function getLocaleNumberMinutes(n: number): string {
  return n === 1 ? "un" : n.toString();
}

export function formatDate(date: Date, { dateTime, ago }: DateFormat) {
  let ret = "";

  if (ago === "yes")
    ret += `Hace ${localeDateAgo(date)}`;

  if (dateTime !== "none") {
    if (ago === "yes")
      ret += " (";

    ret += `${getLongDateStr(date, dateTime)}`;

    if (ago === "yes")
      ret += ")";
  }

  return ret;
}

export function localeWeekDay(weekDay: number): string {
  switch (weekDay) {
    case 0: return "Domingo";
    case 1: return "Lunes";
    case 2: return "Martes";
    case 3: return "Miércoles";
    case 4: return "Jueves";
    case 5: return "Viernes";
    case 6: return "Sábado";
    default: throw new Error(`Invalid weekDay: ${weekDay}`);
  }
}

export function formatDateHHmm(date: Date) {
  const hour = getHH(date);
  const minutes = getMm(date);

  return `${hour}:${minutes}`;
}

export function formatDateDDMMYYY(date: Date) {
  return formatDate(date, {
    dateTime: "date",
    ago: "no",
  } );
}

export function formatDateDDMMYYYHHmm(date: Date) {
  return formatDateDDMMYYY(date) + " " + formatDateHHmm(date);
}
