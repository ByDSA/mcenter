
/* eslint-disable require-await */
import HistoryEntryElement from "#modules/history/entry/HistoryEntryElement";
import { HistoryEntryWithId, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import { assertIsDefined } from "#shared/utils/validation";
import React, { Fragment } from "react";
import useSWR from "swr";
import style from "./style.module.css";
import { getDateStr } from "./utils";

assertIsDefined(process.env.NEXT_PUBLIC_BACKEND_URL);

const URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/history-list/entries/search`;
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
  const { data, error, isLoading } = useSWR(
    URL,
    fetcher,
  );
  const [list, setList] = React.useState(data);

  if (error)
    return <p>Failed to load.</p>;

  if (!list && isLoading) {
    return <p key="aa" style={{
      fontSize: "8vw",
      textAlign: "center",
    }}>Loading...</p>;
  }

  if (list === undefined) {
    setList(data);

    assertIsHistoryListGetManyEntriesBySearchResponse(data);
  }

  return (
    <span className={style.content}>
      {
        list && list.map((entry: HistoryEntryWithId, i: number) => {
          let dayTitle;

          if (i === 0 || !isSameday(list[i - 1].date.timestamp, entry.date.timestamp))
            dayTitle = <h2 key={getDateStr(new Date(entry.date.timestamp * 1000))}>{getDateStr(new Date(entry.date.timestamp * 1000))}</h2>;

          return <Fragment key={`${entry.serieId} ${entry.episodeId}`}>
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