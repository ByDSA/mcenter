import { HistoryEntry, HistoryEntryWithId, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import "#styles/resources/history-entry.css";
import "#styles/resources/serie.css";
import React from "react";
import { backendUrls } from "../requests";
import Body from "./body/Body";
import Header from "./header/Header";
import style from "./style.module.css";

type Props = {
  value: HistoryEntryWithId;
  onRemove?: (data: HistoryEntry)=> void;
};
export default function HistoryEntryElement( {value}: Props) {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div className={style.container}>
      <Header entry={value} toggleShowBody={()=>setShowDropdown(!showDropdown)} showDate={false}/>
      <Body entry={value} isBodyVisible={showDropdown}/>
    </div>
  );
}

export function fetchLastestHistoryEntries(historyEntry: HistoryEntry): Promise<HistoryEntryWithId[] | null> {
  const URL = backendUrls.entries.crud.search;
  const bodyJson: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
    "filter": {
      "serieId": historyEntry.episodeId.serieId,
      "episodeId": historyEntry.episodeId.innerId,
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
    } );
}