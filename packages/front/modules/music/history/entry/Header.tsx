import { formatDate } from "#modules/utils/dates";
import { HistoryMusicEntry } from "#shared/models/musics";
import style from "./style.module.css";

type HeaderProps = {
  entry: Required<HistoryMusicEntry>;
  resource: Required<HistoryMusicEntry>["resource"];
  showDropdownState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  showDate: boolean;
};
export default function Header( {resource, entry, showDropdownState, showDate}: HeaderProps) {
  const center = resource.artist;
  const leftCenter = `${resource.title } - ${ resource.artist}`;
  const left = resource.title;
  const right = resource.weight.toString();
  const timeStampDate = new Date(entry.date.timestamp * 1000);
  const [showDropdown, setShowDropdown] = showDropdownState;

  return <div className={style.header} onClick={()=>setShowDropdown(!showDropdown)}>
    <div className={style.fullTime}>
      <span className={style.time}>{timeStampDate.toLocaleTimeString()}</span>

      {showDate &&
      <span className={style.date}>{formatDate(timeStampDate, {
        dateTime: "date",
        ago: "no",
      } )}</span> }
    </div>
    <div className={style.name}>
      { leftCenter && <span className={`${style.itemLeftCenter} ${style.hideMinLg} ${style.center}`}>{leftCenter}</span> }
      { left && <span className={`${style.item} ${style.showMinLg}`}>{left}</span> }
      { center && <p className={`${style.item} ${style.showMinLg} ${style.center}`}>{center}</p> }
      { right && <span className={style.item}>{right}</span> }
    </div>
  </div>;
}