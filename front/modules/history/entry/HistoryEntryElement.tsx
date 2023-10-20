import { getBackendUrl } from "#modules/utils";
import { Episode, EpisodeFullId, assertIsEpisode } from "#shared/models/episodes";
import { HistoryEntry, HistoryEntryId, HistoryEntryWithId, HistoryListGetManyEntriesBySuperIdRequest, HistoryListId, assertIsHistoryEntryWithId, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import Loading from "app/loading";
import React, { Fragment, useEffect, useRef } from "react";
import { getDateStr } from "../utils";
import style from "./style.module.css";

type Props = {
  value: HistoryEntryWithId;
  onRemove?: (data: HistoryEntry)=> void;
};
export default function HistoryEntryElement( {value, onRemove}: Props) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const hasDropdownBeenShown = useRef(false);
  const [entry, setEntry] = React.useState(value);
  const [currentWeight, setCurrentWeight] = React.useState(value.episode?.weight);
  const [currentStart, setCurrentStart] = React.useState(value.episode?.start);
  const [currentEnd, setCurrentEnd] = React.useState(value.episode?.end);
  const [isModified, setIsModified] = React.useState(false);
  const [name, setName] = React.useState("");
  const [lastest, setLastest] = React.useState<HistoryEntryWithId[] | undefined>(undefined);

  useEffect(() => {
    let newName = "";

    if (entry.episode?.title.trim() && !entry.episode.title.includes(entry.episodeId))
      newName += `${entry.episode.title}`;

    setName(newName);
  }, [entry.episode?.title, entry.episodeId]);

  useEffect(() => {
    if (showDropdown && !hasDropdownBeenShown.current) {
      fetchSecureLastestHistoryEntries(value).then((data: HistoryEntryWithId[] | null) => {
        if (!data)
          return;

        const onlyTwo = data.slice(0, 2);

        setLastest(onlyTwo);
      } );
    }
  }
  , [showDropdown]);

  useEffect(() => {
    if (lastest)
      hasDropdownBeenShown.current = true;
  }, [lastest]);

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
        } as HistoryEntryWithId);
      } );
  };
  const remove = () => {
    const historyEntryId = value.id;
    const {historyListId} = value;

    fetchSecureDelete(historyListId, historyEntryId)
      .then((data: HistoryEntry | null) => {
        if (!data)
          return;

        onRemove?.(entry);
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
        {value.episode?.fileInfo?.mediaInfo.duration &&
        <span>
          <span>Duration : {secsToMS(value.episode?.fileInfo?.mediaInfo.duration)} ({value.episode?.fileInfo?.mediaInfo.duration} s)</span>
        </span>
        }
        <span className={style.break} />
        <span><a onClick={() => reset()}>Reset</a></span>
        {isModified && <span><a href="#" onClick={() => update()}>Update</a></span>}
        <span className={style.break} />
        <span><a onClick={()=> {
          // eslint-disable-next-line no-restricted-globals, no-alert
          if (confirm(`Borar esta entrada del historial?\n${ JSON.stringify( {
            serieId: entry.serieId,
            episodeId: entry.episodeId,
            date: entry.date,
          }, null, 2)}`))
            remove();
        }}>Borrar</a></span>
        <span className={style.break} />
        {lastestComponent(lastest)}

      </div>
      }
    </div>
  );
}

function lastestComponent(lastest: HistoryEntryWithId[] | undefined) {
  if (!lastest)
    return <Loading/>;

  if (lastest.length === 0)
    return <span>No se había reproducido antes.</span>;

  return <>
    <span>Últimas veces:</span>
    {lastest && lastest.map((e: HistoryEntryWithId) => <Fragment key={`${e.serieId} ${e.episodeId} ${e.date.timestamp}`}>
      <><span className={style.break} /><span>{dateInLastestComponent(new Date(e.date.timestamp * 1000))}</span></>
    </Fragment>)}
  </>;
}

function dateInLastestComponent(date: Date) {
  const days = getDaysSince(date);
  const diasStr = days === 1 ? "día" : "días";

  return `${getDateStr(date)} (hace ${getDaysSince(date)} ${diasStr})`;
}

function getDaysSince(date: Date) {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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

function fetchSecurePatch(id: EpisodeFullId, partial: Partial<Episode>): Promise<Episode | null> {
  const URL = `${getBackendUrl()}/api/episodes/${id.serieId}/${id.episodeId}`;

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

function fetchSecureDelete(listId: HistoryListId, entryId: HistoryEntryId): Promise<HistoryEntry | null> {
  const URL = `${getBackendUrl()}/api/history-list/${listId}/entries/${entryId}`;

  return fetch(URL, {
    method: "DELETE",
  } ).then((response) => response.json())
    .then((historyEntry: HistoryEntry) => {
      assertIsHistoryEntryWithId(historyEntry);

      return historyEntry;
    } )
    .catch((error) => {
      console.error("Error:", error);

      return null;
    } );
}

export function fetchSecureLastestHistoryEntries(historyEntry: HistoryEntry): Promise<HistoryEntryWithId[] | null> {
  const URL = `${getBackendUrl()}/api/history-list/entries/search`;
  const bodyJson: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
    "filter": {
      "serieId": historyEntry.serieId,
      "episodeId": historyEntry.episodeId,
      "timestampMax": historyEntry.date.timestamp - 1,
    },
    "sort": {
      "timestamp": "desc",
    },
    "limit": 10,
  };

  return fetch(URL, {
    method: "POST",
    body: JSON.stringify(bodyJson),
    headers: {
      "Content-Type": "application/json",
    },
  } ).then((response) => response.json())
    .then((data: HistoryEntryWithId[]) => {
      assertIsHistoryListGetManyEntriesBySearchResponse(data);

      return data;
    } )
    .catch((error) => {
      console.error("Error:", error);

      return null;
    } );
}