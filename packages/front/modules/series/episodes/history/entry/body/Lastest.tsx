import { z } from "zod";
import { assertZod } from "#shared/utils/validation/zod";
import { HistoryEntry } from "#modules/series/episodes/history/models";
import { getManyEntriesBySuperId, getManyEntriesBySearch } from "#modules/series/episodes/history/models/dto";
import { EpisodeId } from "#modules/series/episodes/models";
import { DateFormat } from "#modules/utils/dates";
import { LatestHistoryEntries } from "#modules/history";
import { backendUrls } from "../../requests";

type HistoryListGetManyEntriesBySuperIdRequest = {
  body: z.infer<typeof getManyEntriesBySuperId.reqBodySchema>;
};
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

export function LastestComponent(
  { resourceId, date, dateFormat = DATE_FORMAT_DEFAULT }: Props<EpisodeId>,
) {
  const URL = backendUrls.entries.crud.search;
  const body: ReqBody = {
    filter: {
      serieId: resourceId.serieId,
      episodeId: resourceId.innerId,
      timestampMax: date.timestamp - 1,
    },
    sort: {
      timestamp: "desc",
    },
    limit: 10,
  };

  // TODO: cambiar 'any' cuando HistoryEntry tenga 'resource' en vez de 'episode'
  return LatestHistoryEntries<any, ReqBody>( {
    url: URL,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (data: Required<HistoryEntry>[]) => {
  assertZod(getManyEntriesBySearch.resSchema, data);
};
