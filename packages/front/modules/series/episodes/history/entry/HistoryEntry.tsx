import { backendUrls } from "../requests";
import { Header } from "./Header";
import { Body } from "./body/Body";
import { HistoryEntry } from "#modules/series/episodes/history/models";
import { HistoryEntryWithId, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#modules/series/episodes/history/models/transport";
import { ResourceAccordion } from "#modules/ui-kit/accordion";

type Props = {
  value: HistoryEntryWithId;
  onRemove?: (data: HistoryEntry)=> void;
};
export function HistoryEntryElement( { value }: Props) {
  return <span className="history-entry">
    {
      ResourceAccordion( {
        headerContent: <Header entry={value} showDate={false}/>,
        bodyContent: <Body entry={value}/>,
      } )
    }
  </span>;
}

export function fetchLastestHistoryEntries(
  historyEntry: HistoryEntry,
): Promise<HistoryEntryWithId[] | null> {
  const URL = backendUrls.entries.crud.search;
  const bodyJson: HistoryListGetManyEntriesBySuperIdRequest["body"] = {
    filter: {
      serieId: historyEntry.episodeId.serieId,
      episodeId: historyEntry.episodeId.innerId,
      timestampMax: historyEntry.date.timestamp - 1,
    },
    sort: {
      timestamp: "desc",
    },
    limit: 10,
  };

  return fetch(URL, {
    method: "POST",
    body: JSON.stringify(bodyJson),
    headers: {
      "Content-Type": "application/json",
    },
  } ).then((response) => response.json())
    .then((data: HistoryEntryWithId[]) => {
      assertIsHistoryListGetManyEntriesBySearchResponse(data);

      return data;
    } );
}
