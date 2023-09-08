
/* eslint-disable require-await */
import HistoryEntryElement from "#modules/history/entry/HistoryEntryElement";
import { HistoryEntry, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import { assertIsDefined } from "#shared/utils/validation";
import { Fragment } from "react";
import useSWR from "swr";

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

  if (error)
    return <p>Failed to load.</p>;

  if (isLoading) {
    return <p key="aa" style={{
      fontSize: "4rem",
    }}>Loading...</p>;
  }

  assertIsHistoryListGetManyEntriesBySearchResponse(data);

  return (
    <span className="content">
      {
        data.map((entry: HistoryEntry, i: number) => {
          let dayTitle;

          if (i === 0 || !isSameday(data[i - 1].date.timestamp, entry.date.timestamp))
            dayTitle = <h2 key={getDateStr(new Date(entry.date.timestamp * 1000))}>{getDateStr(new Date(entry.date.timestamp * 1000))}</h2>;

          return <Fragment key={`${entry.serieId} ${entry.episodeId}`}>
            {dayTitle}
            <HistoryEntryElement value={entry}/>
          </Fragment>;
        } )
      }

      <style jsx>{`
     .content {
      padding: 2rem 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: center;
    }
    `}</style>
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

function getDateStr(date: Date) {
  return `${getWeekDay(date.getDay())}, ${date.getDate().toString()
    .padStart(2, "0")} / ${date.getMonth().toString()
    .padStart(2, "0")} / ${date.getFullYear()}`;
}

function getWeekDay(weekDay: number): string {
  switch (weekDay) {
    case 0:
      return "Domingo";
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miércoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    case 6:
      return "Sábado";
    default:
      throw new Error(`Invalid weekDay: ${weekDay}`);
  }
}