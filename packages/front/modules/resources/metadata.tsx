/* eslint-disable @typescript-eslint/naming-convention */
import { AccessTime, Balance, CalendarToday } from "@mui/icons-material";
import { memo } from "react";
import { formatDurationItem } from "#modules/musics/playlists/utils";
import { formatDateHHmm } from "#modules/utils/dates";

type DurationProps = {
  duration: number;
};
export const DurationView = memo(( { duration }: DurationProps) => {
  return (
    <span title="Duración">
      <AccessTime />
      <span>{formatDurationItem(duration)}</span>
    </span>
  );
} );

type HistoryTimeProps = {
  timestamp: number;
};
export const HistoryTimeView = memo(( { timestamp }: HistoryTimeProps) => {
  return (
    <span title="Hora de reproducción">
      <CalendarToday />
      <span>{formatDateHHmm(new Date(timestamp * 1_000))}h</span>
    </span>);
} );

type WeightProps = {
  weight: number;
};
export const WeightView = memo(( { weight }: WeightProps) => {
  return (
    <span title="Peso">
      <Balance />
      <span>{formatWeight(weight)}</span>
    </span>);
} );

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
