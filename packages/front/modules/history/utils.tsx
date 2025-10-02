import { AccessTime, Balance, CalendarToday } from "@mui/icons-material";
import { formatDurationItem } from "#modules/musics/playlists/utils";
import { formatDateHHmm } from "#modules/utils/dates";

export const createDurationElement = (duration: number) => {
  return (
    <span title="Duración">
      <AccessTime />
      <span>{formatDurationItem(duration)}</span>
    </span>
  );
};

export const createHistoryTimeElement = (date: Date) => {
  return (
    <span title="Hora de reproducción">
      <CalendarToday />
      <span>{formatDateHHmm(date)}h</span>
    </span>);
};

export const createWeightElement = (weight: number) => {
  return (
    <span title="Peso">
      <Balance />
      <span>{formatWeight(weight)}</span>
    </span>);
};

function formatWeight(weight: number): string {
  let str = weight.toString();
  let count = 0;

  for (let i = str.length; i > 0; i--) {
    if (count === 3) {
      str = str.substring(0, i) + " " + str.substring(i);

      count = 0;
    }

    count++;
  }

  return str;
}
