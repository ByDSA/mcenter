import { Fragment } from "react";
import { FetchingRender } from "#modules/fetching";
import { HistoryEntryElement } from "./entry/HistoryEntry";
import { EpisodeHistoryEntryFetching } from "./requests";
import { getDateStr } from "./utils";

import "#styles/resources/history-entry.css";
import "#styles/resources/history-episodes.css";
import "#styles/resources/serie.css";

export function HistoryList() {
  return FetchingRender<EpisodeHistoryEntryFetching.GetMany.Res>( {
    useRequest: EpisodeHistoryEntryFetching.GetMany.useRequest,
    render: ( { data: res, setData } ) => {
      return (
        <span className="history-list">
          {
            res && res.data.map((entry: EpisodeHistoryEntryFetching.GetMany.Data, i: number) => {
              let dayTitle;

              if (i === 0 || !isSameday(res.data[i - 1].date.timestamp, entry.date.timestamp)) {
                const dateStr = getDateStr(new Date(entry.date.timestamp * 1000));

                dayTitle = <h2 key={dateStr}>{dateStr}</h2>;
              }

              return <Fragment
                key={entry.date.timestamp}>
                {dayTitle}
                <HistoryEntryElement value={entry} setValue={(newEntry: typeof entry |
                  undefined) => {
                  setData((old)=> {
                    if (!old)
                      return undefined;

                    const newData = {
                      ...old,
                    };

                    if (!newEntry) {
                      newData.data = [...newData.data.slice(0, i), ...newData.data.slice(i + 1)];

                      return newData;
                    }

                    newData.data[i] = {
                      ...newEntry,
                      resource: {
                        ...newData.data[i].resource,
                        ...newEntry.resource,
                        serie: newEntry.resource.serie ?? newData.data[i].resource.serie,
                      },
                    };

                    return newData;
                  } );
                }}/>
              </Fragment>;
            } )
          }
        </span>
      );
    },
  } );
}

function isSameday(timestamp1: number, timestamp2: number) {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate();
}
