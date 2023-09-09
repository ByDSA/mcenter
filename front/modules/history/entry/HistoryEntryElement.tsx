import { Episode, EpisodeFullId, assertIsEpisode } from "#shared/models/episodes";
import { HistoryEntry } from "#shared/models/historyLists";
import React, { useEffect } from "react";
import style from "./style.module.css";

type Props = {
  value: HistoryEntry;
};
export default function HistoryEntryElement( {value}: Props) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [entry, setEntry] = React.useState(value);
  const [currentWeight, setCurrentWeight] = React.useState(value.episode?.weight);
  const [currentStart, setCurrentStart] = React.useState(value.episode?.start);
  const [currentEnd, setCurrentEnd] = React.useState(value.episode?.end);
  const [isModified, setIsModified] = React.useState(false);
  const [name, setName] = React.useState("");

  useEffect(() => {
    let newName = "";

    if (entry.episode?.title.trim() && !entry.episode.title.includes(entry.episodeId))
      newName += `${entry.episode.title}`;

    setName(newName);
  }, [entry.episode?.title, entry.episodeId]);

  useEffect(() => {
    const v = entry.episode?.weight !== currentWeight || entry.episode?.start !== currentStart || entry.episode?.end !== currentEnd;

    setIsModified(v);
  }, [entry, currentWeight, currentStart, currentEnd]);
  const reset = () => {
    setCurrentWeight(entry.episode?.weight);
    setCurrentStart(entry.episode?.start);
    setCurrentEnd(entry.episode?.end);
  };
  const update = () => {
    const partial: Partial<Episode> = {
      weight: currentWeight,
      start: currentStart,
      end: currentEnd,
    };
    const fullId = {
      serieId: value.serieId,
      episodeId: value.episodeId,
    };

    fetchSecurePatch(fullId, partial)
      .then((data: Episode | null) => {
        if (!data)
          return;

        setEntry( {
          ...value,
          episode: data,
        } as HistoryEntry);
      } );
  };

  return (
    <div className={style.container}>
      <div className={style.header} onClick={()=>setShowDropdown(!showDropdown)}>
        <div className={style.time}>
          <span>{new Date(value.date.timestamp * 1000).toLocaleTimeString()}</span>
        </div>
        <div className={style.name}>
          <span className={style.item}>{value.serie?.name}</span>
          {name && <p className={`${style.item} ${style.title}`}>{name}</p>}
          <span className={style.item}>{value.episodeId}</span>
        </div>
      </div>
      {showDropdown &&
      <div className={style.dropdown}>
        {name && <p className={`${style.title}`}>Título: {name}</p>}
        <span className={`${style.weight}`}>
          <span>Weight:</span> <input type="number" value={currentWeight} onChange={handleOnChange(setCurrentWeight)}/>
        </span>
        <span className={style.break} />
        <span className={`${style.dropdownTime}`}>
          <span>Start:</span><span><input type="number" value={currentStart} onChange={handleOnChange(setCurrentStart)}/><span> {currentStart && currentStart > 0 ? secsToMS(currentStart) : "-"}</span></span>
        </span>
        <span className={`${style.dropdownTime}`}>
          <span>End:</span><span><input type="number" value={currentEnd} onChange={handleOnChange(setCurrentEnd)}/><span> {currentEnd && currentEnd > 0 ? secsToMS(currentEnd) : "-"}</span></span>
        </span>
        <span className={style.break} />
        <span><a href="#" onClick={() => reset()}>Reset</a></span>
        {isModified && <span><a href="#" onClick={() => update()}>Update</a></span>}
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

function fetchSecurePatch(id: EpisodeFullId,partial: Partial<Episode>): Promise<Episode | null> {
  const URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/episodes/${id.serieId}/${id.episodeId}`;

  return fetch(URL, {
    method: "PATCH",
    body: JSON.stringify(partial),
    headers: {
      "Content-Type": "application/json",
    },
  } ).then((response) => response.json())
    .then((episode: Episode) => {
      assertIsEpisode(episode);

      return episode;
    } )
    .catch((error) => {
      console.error("Error:", error);

      return null;
    } );
}