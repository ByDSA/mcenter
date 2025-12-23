/* eslint-disable @typescript-eslint/naming-convention */
import { AccessTime, Balance, CalendarToday } from "@mui/icons-material";
import { memo } from "react";
import { formatDurationItem } from "#modules/musics/playlists/utils";
import { formatDateHHmm } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import styles from "./WeightView.module.css";

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
  const txt = formatWeight(weight);
  let title = "Peso";
  let change = txt.length >= 7;

  if (change)
    title += ": " + txt;

  return (
    <span title={title} >
      <Balance />
      <span className={classes(change && styles.parent)}>
        {
          change
         && <span className={styles.invisibleTxt}>
           {txt}
         </span>
        }
        <span className={classes(change && styles.txt)}>{txt}</span>
      </span>
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
