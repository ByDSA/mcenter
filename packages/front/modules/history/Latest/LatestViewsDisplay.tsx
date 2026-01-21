import { useState, useEffect } from "react";
import { formatDate, DateFormat } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import styles from "./Latest.module.css";

const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type Props = {
  dates: number[];
  dateFormat?: DateFormat;
};

export const LatestViewsView = ( { dates, dateFormat = DATE_FORMAT_DEFAULT }: Props) => {
  // Estado "dummy" solo para forzar re-render cada X segundos
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (dates.length === 0)
    return <span>No se había reproducido antes.</span>;

  return (
    <DaInputGroup className={styles.group}>
      {dates.map((ts, i) => {
        const firstLine = formatDate(new Date(ts * 1000), {
          ...dateFormat,
          dateTime: "none",
        } );
        const secondLine = formatDate(new Date(ts * 1000), {
          ...dateFormat,
          ago: "no",
        } );

        return (
          <div key={i}>
            <span className={classes("line")}>{firstLine}.</span>
            <span className={classes("line", styles.lastestLine)}>{secondLine}</span>
          </div>
        );
      } )}
    </DaInputGroup>
  );
};
