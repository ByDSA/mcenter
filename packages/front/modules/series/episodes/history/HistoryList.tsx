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
    render: (res) => {
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
                key={`${entry.resourceId.seriesKey} ${entry.resourceId.episodeKey}`}>
                {dayTitle}
                <HistoryEntryElement value={entry}/>
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
