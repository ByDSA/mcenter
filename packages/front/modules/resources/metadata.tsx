import { AccessTime, Balance, CalendarToday } from "@mui/icons-material";
import { memo, ReactNode } from "react";
import { formatDurationItem } from "#modules/musics/lists/playlists/utils";
import { formatDateHHmm } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import styles from "./WeightView.module.css";

type MetadataViewProps = {
  icon: ReactNode;
  txt: string;
  title: string;
  className?: string;
  classNameTxt?: string;
};
export const MetadataView = memo(
  ( { txt, icon, title, className, classNameTxt }: MetadataViewProps) => {
    return (
      <span title={title} className={classes(styles.element, className)}>
        {icon}
        <span className={classNameTxt}>{txt}</span>
      </span>
    );
  },
);
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
  timestamp: number | null;
};
export const HistoryTimeView = memo(( { timestamp }: HistoryTimeProps) => {
  return <MetadataView
    title={"Hora de reproducción"}
    icon={<CalendarToday />}
    txt={timestamp !== null
      ? `${formatDateHHmm(new Date(timestamp * 1_000))}h`
      : ""}
  />;
} );

type WeightProps = {
  weight: number | null;
};
export const WeightView = memo(( { weight }: WeightProps) => {
  const txt = weight !== null
    ? formatWeight(weight)
    : "";
  let title = "Peso";
  let change = txt.length >= 7;

  if (change)
    title += ": " + txt;

  return <MetadataView
    title={title}
    icon={<Balance />}
    classNameTxt={classes(styles.txt, change && styles.change)}
    txt={txt}
  />;
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
