import { WithOptional } from "$shared/utils/objects/types";
import { formatDate } from "#modules/utils/dates";

function dayTitleInner(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(today.getDate() - 1);

  let text: string;

  if (datesAreSameDay(date, today))
    text = "Hoy";
  else if (datesAreSameDay(date, yesterday))
    text = "Ayer";
  else {
    text = formatDate(date, {
      ago: "no",
      dateTime: "fullDate",
    } );
  }

  return <h3>{text}</h3>;
}

export const datesAreSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate()
    && date1.getMonth() === date2.getMonth()
    && date1.getFullYear() === date2.getFullYear();
};

type ShouldShowDateProps = {
  previousDateTimestamp: number;
  currentDateTimestamp: number;
};
function shouldShowDate(
  { currentDateTimestamp, previousDateTimestamp }: ShouldShowDateProps,
) {
  const entryDate = new Date(currentDateTimestamp * 1_000);
  const previousDate = new Date(previousDateTimestamp * 1_000);

  if (!datesAreSameDay(previousDate, entryDate))
    return entryDate;

  return null;
}

export function dayTitle(
  { currentDateTimestamp,
    previousDateTimestamp }: WithOptional<ShouldShowDateProps, "previousDateTimestamp">,
) {
  const entryDate = previousDateTimestamp === undefined
    ? new Date(currentDateTimestamp * 1_000)
    : shouldShowDate( {
      previousDateTimestamp,
      currentDateTimestamp,
    } );

  if (!entryDate)
    return null;

  return dayTitleInner(entryDate);
}
