
/* eslint-disable require-await */
import HistoryEntryElement from "#modules/history/entry/HistoryEntryElement";
import { getBackendUrl } from "#modules/utils";
import { HistoryEntryWithId, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse, historyListEntryDtoToModel } from "#shared/models/historyLists";
import Loading from "app/loading";
import React, { Fragment } from "react";
import useSWR from "swr";
import { getDateStr } from "./utils";

const bodyJson: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
  "filter": {
  },
  "sort": {
    "timestamp": "desc",
  },
  "limit": 10,
  "expand": ["episodes", "series"],
};

export const fetcher = async (url: string) => {
  const options = {
    method: "POST",
    cors: "no-cors",
    body: JSON.stringify(bodyJson),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return fetch(url, options).then(r => r.json());
};

export default function Page() {
  const URL = `${getBackendUrl()}/api/history-list/entries/search`;
  const { data:dto, error, isLoading } = useSWR(
    URL,
    fetcher,
  );
  let data = dto;

  if (!error && dto)
    data = (dto as any[]).map(historyListEntryDtoToModel);

  const [list, setList] = React.useState(data);

  if (error)
  {return <>
    <p>Failed to load.</p>
    <p>{URL}</p>
    <p>{JSON.stringify(error, null, 2)}</p>
  </>;}

  if (!list && isLoading)
    return <Loading/>;

  if (list === undefined) {
    setList(data);

    assertIsHistoryListGetManyEntriesBySearchResponse(data);
  }

  return (
    <span style={{
      flexDirection:"column",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
    }}>
      {
        list && list.map((entry: HistoryEntryWithId, i: number) => {
          let dayTitle;

          if (i === 0 || !isSameday(list[i - 1].date.timestamp, entry.date.timestamp))
            dayTitle = <h2 key={getDateStr(new Date(entry.date.timestamp * 1000))}>{getDateStr(new Date(entry.date.timestamp * 1000))}</h2>;

          return <Fragment key={`${entry.episodeId.serieId} ${entry.episodeId}`}>
            {dayTitle}
            <HistoryEntryElement value={entry} onRemove={() => {
              setList(list.toSpliced(i, 1));
            }}/>
          </Fragment>;
        } )
      }
    </span>
  );
}

function isSameday(timestamp1: number, timestamp2: number) {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}