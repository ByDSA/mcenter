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
  disabled?: boolean;
};
export const MetadataView = memo(
  ( { txt, icon, title, disabled, className, classNameTxt }: MetadataViewProps) => {
    return (
      <span title={title} className={classes(
        styles.element,
        disabled && styles.disabled,
        className,
      )}>
        {icon}
        <span className={classNameTxt}>{txt}</span>
      </span>
    );
  },
);
type DurationProps = {
  duration: number;
  className?: string;
  disabled?: boolean;
};
export const DurationView = memo(( { disabled, duration, className }: DurationProps) => {
  return <MetadataView
    icon={<AccessTime />}
    title="Duración"
    disabled={disabled}
    className={className}
    txt={formatDurationItem(duration)}
  />;
} );

type HistoryTimeProps = {
  timestamp: number | null;
  disabled?: boolean;
};
export const HistoryTimeView = memo(( { disabled, timestamp }: HistoryTimeProps) => {
  return <MetadataView
    disabled={disabled}
    title={"Hora de reproducción"}
    icon={<CalendarToday />}
    txt={timestamp !== null
      ? `${formatDateHHmm(new Date(timestamp * 1_000))}h`
      : ""}
  />;
} );

type WeightProps = {
  weight: number | null;
  disabled?: boolean;
};
export const WeightView = memo(( { disabled, weight }: WeightProps) => {
  const txt = weight !== null
    ? formatWeight(weight)
    : "";
  let title = "Peso";
  let change = txt.length >= 7;

  if (change)
    title += ": " + txt;

  return <MetadataView
    title={title}
    disabled={disabled}
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
