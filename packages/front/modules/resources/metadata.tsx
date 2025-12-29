/* eslint-disable @typescript-eslint/naming-convention */
import { AccessTime, Balance, CalendarToday } from "@mui/icons-material";
import { memo, ReactNode } from "react";
import { formatDurationItem } from "#modules/musics/playlists/utils";
import { formatDateHHmm } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import styles from "./WeightView.module.css";

type MetadataViewProps = {
  icon: ReactNode;
  txt: string;
  title: string;
  className?: string;
};
export const MetadataView = memo(( { txt, icon, title, className }: MetadataViewProps) => {
  return (
    <span title={title} className={classes(styles.element, className)}>
      {icon}
      <span>{txt}</span>
    </span>
  );
} );
type DurationProps = {
  duration: number;
  className?: string;
};
export const DurationView = memo(( { duration, className }: DurationProps) => {
  return <MetadataView
    icon={<AccessTime />}
    title="Duración"
    className={className}
    txt={formatDurationItem(duration)}
  />;
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
