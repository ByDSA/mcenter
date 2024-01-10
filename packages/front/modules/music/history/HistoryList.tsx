
/* eslint-disable require-await */
import { assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import { HistoryMusicEntry } from "#shared/models/musics";
import Loading from "app/loading";
import extend from "just-extend";
import React, { Fragment } from "react";
import HistoryEntryElement from "./entry/HistoryEntry";
import { getDateStr } from "./utils";

let error;

type T = HistoryMusicEntry;
const data: Required<T>[] = [
  {
    date: {
      timestamp: 1704900141,
      day: 10,
      month: 1,
      year: 2024,
    },
    resourceId: "resourceId",
    resource: {
      title: "title",
      weight: 0,
      artist: "artist",
      hash: "hash",
      mediaInfo: {
        duration: 0,
      },
      path: "path",
      size: 0,
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      url: "url",
      tags: ["car", "work"],
    },
  },
  {
    date: {
      timestamp: 1704799141,
      day: 9,
      month: 1,
      year: 2024,
    },
    resourceId: "resourceId",
    resource: {
      title: "title",
      weight: 0,
      artist: "artist",
      hash: "hash",
      mediaInfo: {
        duration: 2,
      },
      path: "path",
      size: 123,
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      url: "url",
      tags: ["car", "work2"],
    },
  },
];
const isLoading = false;
const URL = "";

type Props = {
  splitByDay?: boolean;
};
const DEFAULT_PARAMS: Required<Props> = {
  splitByDay: true,
};

export default function HistoryList(props?: Props) {
  const params = extend(true, DEFAULT_PARAMS, props) as typeof DEFAULT_PARAMS;
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
        list && list.map((entry: Required<T>, i: number, array: Required<T>[]) => <Fragment key={`${entry.resourceId} ${entry.date.timestamp}`}>
          {params.splitByDay ? dayTitle(entry, i, array) : null}
          <HistoryEntryElement value={entry} />
        </Fragment>)
      }
    </span>
  );
}

function dayTitle(entry: Required<T>, i: number, array: Required<T>[]) {
  if (i === 0 || !isSameday(array[i - 1].date.timestamp, entry.date.timestamp))
    return <h2 key={getDateStr(new Date(entry.date.timestamp * 1000))}>{getDateStr(new Date(entry.date.timestamp * 1000))}</h2>;

  return null;
}

function isSameday(timestamp1: number, timestamp2: number) {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}