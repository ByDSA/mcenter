
/* eslint-disable require-await */
import { FetchingRender } from "#modules/fetching";
import { HistoryMusicEntry } from "#shared/models/musics";
import extend from "just-extend";
import { Fragment } from "react";
import HistoryEntryElement from "./entry/HistoryEntry";
import { useRequest } from "./request";
import { getDateStr } from "./utils";

type Props = {
  splitByDay?: boolean;
};
const DEFAULT_PARAMS: Required<Props> = {
  splitByDay: true,
};

export default function HistoryList(props?: Props) {
  const params = extend(true, DEFAULT_PARAMS, props) as typeof DEFAULT_PARAMS;

  return FetchingRender<Required<HistoryMusicEntry>[]>( {
    useRequest,
    render: (data) => (
      <span style={{
        flexDirection:"column",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
      }}>
        {
          data && data.map((entry, i, array) => <Fragment key={`${entry.resourceId} ${entry.date.timestamp}`}>
            {params.splitByDay ? dayTitle(entry, i, array) : null}
            <HistoryEntryElement value={entry} />
          </Fragment>)
        }
      </span>
    ),
  } );
}

function dayTitle(entry: Required<HistoryMusicEntry>, i: number, array: Required<HistoryMusicEntry>[]) {
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