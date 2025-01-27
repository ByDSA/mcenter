export const SECS_IN_HOUR = 60 * 60;

export const SECS_IN_DAY = 24 * SECS_IN_HOUR;

export const secsBetween = (date1: Date, date2: Date = new Date()) => {
  const diff = date2.getTime() - date1.getTime();

  return diff / 1000;
};

export function daysBetween(date1: Date, date2 = new Date()) {
  const diffSecs = secsBetween(date1, date2);
  const diffDays = Math.floor(diffSecs / SECS_IN_DAY);

  return diffDays;
}
