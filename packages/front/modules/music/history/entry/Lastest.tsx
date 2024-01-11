import { FetchingRender, UseRequest, makeFetcher, makeUseRequest } from "#modules/fetching";
import { getBackendUrl } from "#modules/utils";
import { DateFormat, formatDate } from "#modules/utils/dates";
import { HistoryMusicEntry, HistoryMusicListGetManyEntriesBySearchRequest, assertIsHistoryMusicListGetManyEntriesBySearchResponse, assertIsMusicVO } from "#shared/models/musics";
import { Fragment } from "react";
import style from "./style.module.css";

type Props = {
  resourceId: string;
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

export default function LastestComponent( {resourceId, dateFormat = DATE_FORMAT_DEFAULT}: Props) {
  const body: HistoryMusicListGetManyEntriesBySearchRequest["body"] = {
    "filter": {
      resourceId,
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
    refreshInterval: 1 * 1000,
  } );

  return FetchingRender<HistoryMusicEntry[]>( {
    useRequest,
    render: (data) => {
      if (data.length === 0)
        return <span>No se había reproducido antes.</span>;

      return <>
        <span className={style.line1half}>Últimas veces:</span>
        {data && data.map((entry: HistoryMusicEntry) => <Fragment key={`${entry.date.timestamp}`}>
          <span className={style.line1}>{formatDate(new Date(entry.date.timestamp * 1000), dateFormat)}</span>
        </Fragment>)}
      </>;
    },
  } );
}
const validator = (data: Required<HistoryMusicEntry>[]) => {
  assertIsHistoryMusicListGetManyEntriesBySearchResponse(data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};