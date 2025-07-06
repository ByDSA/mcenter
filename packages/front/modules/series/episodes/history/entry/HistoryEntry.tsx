import { z } from "zod";
import { assertZod } from "#shared/utils/validation/zod";
import { HistoryEntry } from "#modules/series/episodes/history/models";
import { HistoryEntryWithId } from "#modules/series/episodes/history/models";
import { getManyEntriesBySuperId, getManyEntriesBySearch } from "#modules/series/episodes/history/models/dto";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { backendUrls } from "../requests";
import { Header } from "./Header";
import { Body } from "./body/Body";

type HistoryListGetManyEntriesBySuperIdRequest = {
  body: z.infer<typeof getManyEntriesBySuperId.reqBodySchema>;
};

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
      assertZod(getManyEntriesBySearch.resSchema, data);

      return data;
    } );
}
