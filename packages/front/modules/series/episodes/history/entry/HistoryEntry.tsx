import { z } from "zod";
import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeHistoryEntry, episodeHistoryEntryEntitySchema } from "#modules/series/episodes/history/models";
import { EpisodeHistoryEntryEntity } from "#modules/series/episodes/history/models";
import { EpisodeHistoryEntriesCriteria } from "#modules/series/episodes/history/models/dto";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { backendUrl } from "#modules/requests";
import { Header } from "./Header";
import { Body } from "./body/Body";

type Props = {
  value: EpisodeHistoryEntryEntity;
  onRemove?: (data: EpisodeHistoryEntry)=> void;
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
  historyEntry: EpisodeHistoryEntry,
): Promise<EpisodeHistoryEntryEntity[] | null> {
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.search.path);
  const bodyJson: EpisodeHistoryEntriesCriteria = {
    filter: {
      serieId: historyEntry.episodeId.serieId,
      episodeId: historyEntry.episodeId.code,
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
    .then((res: DataResponse<EpisodeHistoryEntryEntity[]>) => {
      assertIsManyDataResponse(res, z.array(episodeHistoryEntryEntitySchema));

      return res.data;
    } );
}
