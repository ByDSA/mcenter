import { formatDate } from "#modules/utils/dates";
import { HistoryMusicEntry } from "#shared/models/musics";
import style from "./style.module.css";

type HeaderProps = {
  entry: Required<HistoryMusicEntry>;
  toggleShowBody: ()=> void;
  showDate: boolean;
};
export default function Header( {entry, toggleShowBody, showDate}: HeaderProps) {
  const {resource} = entry;
  const {title} = resource;
  const subtitle = resource.game ?? resource.artist;
  const right = resource.weight.toString();
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return <div className={style.header} onClick={()=>toggleShowBody()}>
    <div className={style.fullTime}>
      <span className={style.time}>{timeStampDate.toLocaleTimeString()}</span>

      {showDate &&
      <span className={style.date}>{formatDate(timeStampDate, {
        dateTime: "date",
        ago: "no",
      } )}</span> }
    </div>
    <span className={`${style.center} ellipsis`}>
      <span className="ellipsis">{title}</span>
      <span className="ellipsis">{subtitle}</span>
    </span>
    { right && <span className={style.item}>{right}</span> }
  </div>;
}