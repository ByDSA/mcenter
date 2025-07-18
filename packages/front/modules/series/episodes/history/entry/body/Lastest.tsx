import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeHistoryEntry, EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "#modules/series/episodes/history/models";
import { EpisodeHistoryEntriesCriteria } from "#modules/series/episodes/history/models/dto";
import { EpisodeId } from "#modules/series/episodes/models";
import { DateFormat } from "#modules/utils/dates";
import { LatestHistoryEntries } from "#modules/history";
import { backendUrl } from "#modules/requests";

type Data = EpisodeHistoryEntryEntity[];

type Props<ID> = {
  resourceId: ID;
  date: EpisodeHistoryEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type ReqBody = EpisodeHistoryEntriesCriteria;

export function LastestComponent(
  { resourceId, date, dateFormat = DATE_FORMAT_DEFAULT }: Props<EpisodeId>,
) {
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.search.path);
  const body: ReqBody = {
    filter: {
      serieId: resourceId.serieId,
      episodeId: resourceId.code,
      timestampMax: date.timestamp - 1,
    },
    sort: {
      timestamp: "desc",
    },
    limit: 10,
  };

  // TODO: cambiar 'any' cuando EpisodeHistoryEntry tenga 'resource' en vez de 'episode'
  return LatestHistoryEntries<any, ReqBody>( {
    url: URL,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (res: DataResponse<Data>) => {
  assertIsManyDataResponse(res, episodeHistoryEntryEntitySchema as any);
};
