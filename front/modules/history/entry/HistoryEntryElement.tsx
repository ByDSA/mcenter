import { HistoryEntry } from "#shared/models/historyLists";
import React from "react";
import style from "./style.module.css";

type Props = {
  value: HistoryEntry;
};
export default function HistoryEntryElement( {value}: Props) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [currentWeight, setCurrentWeight] = React.useState(value.episode.weight);
  const [currentStart, setCurrentStart] = React.useState(value.episode.start);
  const [currentEnd, setCurrentEnd] = React.useState(value.episode.end);
  let name = "";

  if (value.episode.title.trim() && !value.episode.title.includes(value.episodeId))
    name += `${value.episode.title}`;

  const reset = () => {
    setCurrentWeight(value.episode.weight);
    setCurrentStart(value.episode.start);
    setCurrentEnd(value.episode.end);
  };

  return (
    <div className={style.container}>
      <div className={style.title} onClick={()=>setShowDropdown(!showDropdown)}>
        <div className={style.time}>
          <span>{new Date(value.date.timestamp * 1000).toLocaleTimeString()}</span>
        </div>
        <div className={style.name}>
          <span className={style.item}>{value.serie.name}</span>
          {name && <p className={style.item}>{name}</p>}
          <span className={style.item}>{value.episodeId}</span>
        </div>
      </div>
      {showDropdown &&
      <div className={style.dropdown}>
        <span>
          <span>Weight:</span> <input type="number" value={currentWeight} onChange={handleOnChange(setCurrentWeight)}/>
        </span>
        <span className={style.dropdownTime}>
          <span>Start:</span><span><input type="number" value={currentStart} onChange={handleOnChange(setCurrentStart)}/><span> {currentStart > 0 ? secsToMS(currentStart) : "-"}</span></span>
        </span>
        <span className={style.dropdownTime}>
          <span>End:</span><span><input type="number" value={currentEnd} onChange={handleOnChange(setCurrentEnd)}/><span> {currentEnd > 0 ? secsToMS(currentEnd) : "-"}</span></span>
        </span>
        <span><a href="#" onClick={() => reset()}>Reset</a></span>
      </div>
      }
    </div>
  );
}

function secsToMS(secs: number) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  const secondsInt = Math.floor(seconds);
  const secondsDecimal = seconds - secondsInt;

  return `${minutes.toString().padStart(2, "0")}:${secondsInt.toString().padStart(2,"0")}${ secondsDecimal ? secondsDecimal.toFixed(2).substring(1) : ""}`;
}

function handleOnChange(f: React.Dispatch<React.SetStateAction<number>>) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;

    f(v);
  };
}