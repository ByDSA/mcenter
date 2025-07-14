import { Fragment } from "react";
import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "#modules/series/episodes/history/models";
import { FetchingRender } from "#modules/fetching";
import { HistoryEntryElement } from "./entry/HistoryEntry";
import { useRequest } from "./requests";
import { getDateStr } from "./utils";

import "#styles/resources/history-entry.css";
import "#styles/resources/history-episodes.css";
import "#styles/resources/serie.css";

type Data = Required<EpisodeHistoryEntryEntity>[];
export function HistoryList() {
  return FetchingRender<DataResponse<Data>>( {
    useRequest,
    render: (res) => {
      assertIsManyDataResponse(res, episodeHistoryEntryEntitySchema);

      return (
        <span className="history-list">
          {
            res && res.data.map((entry: EpisodeHistoryEntryEntity, i: number) => {
              let dayTitle;

              if (i === 0 || !isSameday(res.data[i - 1].date.timestamp, entry.date.timestamp)) {
                dayTitle = <h2 key={getDateStr(new Date(entry.date.timestamp * 1000))}>{
                  getDateStr(new Date(entry.date.timestamp * 1000))
                }</h2>;
              }

              return <Fragment key={`${entry.episodeId.serieId} ${entry.episodeId.innerId}`}>
                {dayTitle}
                <HistoryEntryElement value={entry} onRemove={() => {
                // TODO: refresh fetch
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
