import { z } from "zod";
import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses/rest";
import { PATH_ROUTES } from "$shared/routing";
import { HistoryEntry, historyEntryEntitySchema } from "#modules/series/episodes/history/models";
import { HistoryEntryEntity } from "#modules/series/episodes/history/models";
import { historyListRestDto } from "#modules/series/episodes/history/models/dto";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { backendUrl } from "#modules/requests";
import { Header } from "./Header";
import { Body } from "./body/Body";

type HistoryListGetManyEntriesBySuperIdRequest = {
  body: z.infer<typeof historyListRestDto.getManyEntriesBySuperId.reqBodySchema>;
};

type Props = {
  value: HistoryEntryEntity;
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
): Promise<HistoryEntryEntity[] | null> {
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.search.path);
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
    .then((res: DataResponse<HistoryEntryEntity[]>) => {
      assertIsManyDataResponse(res, z.array(historyEntryEntitySchema));

      return res.data;
    } );
}
