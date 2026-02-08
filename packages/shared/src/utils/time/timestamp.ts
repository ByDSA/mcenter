export function dateToTimestampInSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
