import { FetchingRender, UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { DateFormat, formatDate } from "#modules/utils/dates";
import { HistoryEntry, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import { Fragment, useEffect, useState } from "react";
import { backendUrls } from "../../requests";
import style from "./style.module.css";

type Props = {
  historyEntry: HistoryEntry;
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type HooksRet = {
  datesStr: string[];
};

export default function LastestComponent( {historyEntry, dateFormat = DATE_FORMAT_DEFAULT}: Props) {
  const URL = backendUrls.entries.crud.search;
  const body: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
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
  const method = "POST";
  const fetcher = makeFetcher( {
    method,
    body,
    resBodyValidator: validator,
  } );
  const useRequest: UseRequest<HistoryEntry[]> = makeUseRequest<HistoryListGetManyEntriesBySuperIdRequest["body"], Required<HistoryEntry>[]>( {
    key: {
      url: URL,
      method,
      body,
    },
    fetcher,
  } );

  return FetchingRender<HistoryEntry[], HooksRet>( {
    useRequest,
    hooks: (data) => {
      const [datesStr, setDatesStr] = useState([] as string[]);

      useEffect(() => {
        const f = () => {
          const timestamps = data?.map((entry: HistoryEntry) => entry.date.timestamp);
          const newDatesStr = timestamps?.map((timestamp) => formatDate(new Date(timestamp * 1000), dateFormat)) ?? [];

          if (!deepCompareArrays(datesStr, newDatesStr))
            setDatesStr(newDatesStr);
        };

        f();

        const interval = setInterval(f, 5 * 1000);

        return () => clearInterval(interval);
      }, [data]);

      return {
        datesStr,
      };
    },
    render: (data, hooksRet) => {
      const {datesStr} = hooksRet;

      if (data.length === 0)
        return <span>No se había reproducido antes.</span>;

      return <>
        <span className={style.line1half}>Últimas veces:</span>
        {datesStr.map((d: string, i) => <Fragment key={`${data[i].date.timestamp}`}>
          <span className={style.line1}>{d}</span>
        </Fragment>)}
      </>;
    },
  } );
}

function deepCompareArrays<T>(a: T[], b: T[]) {
  if (a.length !== b.length)
    return false;

  for (let i = 0; i < a.length; i++)
  {if (a[i] !== b[i])
    return false;}

  return true;
}
const validator = (data: Required<HistoryEntry>[]) => {
  assertIsHistoryListGetManyEntriesBySearchResponse(data);
};