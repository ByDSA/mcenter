import { classes } from "#modules/utils/styles";
import styles from "./style.module.css";

type HeaderProps = {
  time: string;
  date?: string;
  title: string;
  subtitle: string;
  right?: string;
};
export function Header( { time, date, title, subtitle, right }: HeaderProps) {
  return <span className={styles.container}>
    <div className={styles.fullTime}>
      <span className={styles.time}>{time}</span>

      {date
      && <span className={styles.date}>{date}</span> }
    </div>
    <span className={classes("center", "ellipsis")}>
      <span className="ellipsis">{title}</span>
      <span className="ellipsis">{subtitle}</span>
    </span>
    { right && <span className={styles.item}>{right}</span> }
  </span>;
}
