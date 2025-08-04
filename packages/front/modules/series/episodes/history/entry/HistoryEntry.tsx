import { z } from "zod";
import { assertIsManyResultResponse, ResultResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeHistoryEntry, episodeHistoryEntryEntitySchema } from "#modules/series/episodes/history/models";
import { EpisodeHistoryEntryEntity } from "#modules/series/episodes/history/models";
import { EpisodeHistoryEntryCrudDtos } from "#modules/series/episodes/history/models/dto";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { backendUrl } from "#modules/requests";
import { EpisodeHistoryEntryFetching } from "../requests";
import { Header } from "./Header";
import { Body } from "./body/Body";

type Props = {
  value: EpisodeHistoryEntryFetching.GetMany.Data;
  showDate?: boolean;
};
export function HistoryEntryElement( { value, showDate = false }: Props) {
  return <span className="history-entry">
    {
      ResourceAccordion( {
        headerContent: <Header entry={value} showDate={showDate}/>,
        bodyContent: <Body data={value}/>,
      } )
    }
  </span>;
}

export function fetchLastestHistoryEntries(
  historyEntry: EpisodeHistoryEntry,
): Promise<EpisodeHistoryEntryEntity[] | null> {
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.search.path);
  const bodyJson: EpisodeHistoryEntryCrudDtos.GetManyByCriteria.Criteria = {
    filter: {
      seriesKey: historyEntry.resourceId.seriesKey,
      episodeKey: historyEntry.resourceId.episodeKey,
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
    .then((res: ResultResponse<EpisodeHistoryEntryEntity[]>) => {
      assertIsManyResultResponse(res, z.array(episodeHistoryEntryEntitySchema));

      return res.data;
    } );
}
