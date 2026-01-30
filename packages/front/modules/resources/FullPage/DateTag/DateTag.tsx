import { CalendarToday } from "@mui/icons-material";
import { ReactNode } from "react";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

export const DateTag = ( { date, className }: { date: Date;
className?: string; } ) => {
  return <InfoTag
    title="Fecha"
    icon={<CalendarToday />}
    className={className}>
    {formatDateDDMMYYY(date)}
  </InfoTag>;
};

type Props = {
  icon: ReactNode;
  iconClassName?: string;
  title?: string;
  className?: string;
  children: ReactNode;
};
export const InfoTag = (props: Props) => {
  return (
    <div className={classes(styles.container, props.className)} title={props.title}>
      <span className={classes(styles.wrapSvg, props.iconClassName)}>
        {props.icon}
      </span>
      <span>{props.children}</span>
    </div>
  );
};
