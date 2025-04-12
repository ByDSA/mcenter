import { classes } from "#modules/utils/styles";
import style from "./style.module.css";

type HeaderProps = {
  time: string;
  date?: string;
  title: string;
  subtitle: string;
  right?: string;
};
export function Header( { time, date, title, subtitle, right }: HeaderProps) {
  return <span className={style.container}>
    <div className={style.fullTime}>
      <span className={style.time}>{time}</span>

      {date
      && <span className={style.date}>{date}</span> }
    </div>
    <span className={classes("center", "ellipsis")}>
      <span className="ellipsis">{title}</span>
      <span className="ellipsis">{subtitle}</span>
    </span>
    { right && <span className={style.item}>{right}</span> }
  </span>;
}
