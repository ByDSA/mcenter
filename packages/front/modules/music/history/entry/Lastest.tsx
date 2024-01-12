import { FetchingRender, UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { getBackendUrl } from "#modules/utils";
import { DateFormat, formatDate } from "#modules/utils/dates";
import { HistoryMusicEntry, HistoryMusicListGetManyEntriesBySearchRequest, assertIsHistoryMusicListGetManyEntriesBySearchResponse, assertIsMusicVO } from "#shared/models/musics";
import { Fragment, useEffect, useState } from "react";
import style from "./style.module.css";

type Props = {
  resourceId: string;
  date: HistoryMusicEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type HooksRet = {
  datesStr: string[];
};

export default function LastestComponent( {resourceId, date, dateFormat = DATE_FORMAT_DEFAULT}: Props) {
  const body: HistoryMusicListGetManyEntriesBySearchRequest["body"] = {
    "filter": {
      resourceId,
      timestampMax: date.timestamp - 1,
    },
    "sort": {
      "timestamp": "desc",
    },
    "limit": 2,
    "expand": ["musics"],
  };
  const fetcher = makeFetcher( {
    method: "POST",
    body,
    validator,
  } );
  const useRequest: UseRequest<HistoryMusicEntry[]> = makeUseRequest<Required<HistoryMusicEntry>[]>( {
    url: `${getBackendUrl()}/api/musics/history/user/search`,
    fetcher,
  } );

  return FetchingRender<HistoryMusicEntry[], HooksRet>( {
    useRequest,
    hooks: (data) => {
      const [datesStr, setDatesStr] = useState([] as string[]);

      useEffect(() => {
        const f = () => {
          const timestamps = data?.map((entry: HistoryMusicEntry) => entry.date.timestamp);
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
const validator = (data: Required<HistoryMusicEntry>[]) => {
  assertIsHistoryMusicListGetManyEntriesBySearchResponse(data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};