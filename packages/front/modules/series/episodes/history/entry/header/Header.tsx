import { formatDate } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import { HistoryEntryWithId } from "#shared/models/historyLists";
import { assertIsDefined } from "#shared/utils/validation";
import style from "./style.module.css";

type HeaderProps = {
  entry: HistoryEntryWithId;
  toggleShowBody: ()=> void;
  showDate: boolean;
};
export default function Header( {entry, toggleShowBody, showDate}: HeaderProps) {
  const {episode, serie} = entry;

  assertIsDefined(episode);
  assertIsDefined(serie);
  const title = episode.title ? `${episode.title}` : episode.id.innerId ?? "(Sin título)";
  const subtitle = serie.name ?? episode.id.serieId;
  const right = episode.id.innerId;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return <div className={classes(style.header, "noselect")} onClick={()=>toggleShowBody()}>
    <div className={style.fullTime}>
      <span className={style.time}>{timeStampDate.toLocaleTimeString()}</span>

      {showDate &&
      <span className={style.date}>{formatDate(timeStampDate, {
        dateTime: "date",
        ago: "no",
      } )}</span> }
    </div>
    <span className={classes(style.center, "ellipsis")}>
      <span className="ellipsis">{title}</span>
      <span className="ellipsis">{subtitle}</span>
    </span>
    { right && <span className={style.item}>{right}</span> }
  </div>;
}