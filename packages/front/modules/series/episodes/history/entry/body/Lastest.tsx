import { LatestHistoryEntries } from "#modules/history";
import { DateFormat } from "#modules/utils/dates";
import { EpisodeId } from "#shared/models/episodes";
import { HistoryEntry, HistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetManyEntriesBySearchResponse } from "#shared/models/historyLists";
import { backendUrls } from "../../requests";

type Props<ID> = {
  resourceId: ID;
  date: HistoryEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type ReqBody = HistoryListGetManyEntriesBySuperIdRequest["body"];

export default function LastestComponent( {resourceId, date, dateFormat = DATE_FORMAT_DEFAULT}: Props<EpisodeId>) {
  const URL = backendUrls.entries.crud.search;
  const body: ReqBody = {
    "filter": {
      "serieId": resourceId.serieId,
      "episodeId": resourceId.innerId,
      "timestampMax": date.timestamp - 1,
    },
    "sort": {
      "timestamp": "desc",
    },
    "limit": 10,
  };

  return LatestHistoryEntries<any, ReqBody>( { // TODO: cambiar 'any' cuando HistoryEntry tenga 'resource' en vez de 'episode'
    url: URL,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (data: Required<HistoryEntry>[]) => {
  assertIsHistoryListGetManyEntriesBySearchResponse(data);
};