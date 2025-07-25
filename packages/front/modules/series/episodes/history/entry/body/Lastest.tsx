import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "#modules/series/episodes/history/models";
import { EpisodeHistoryEntryRestDtos } from "#modules/series/episodes/history/models/dto";
import { EpisodeCompKey } from "#modules/series/episodes/models";
import { DateFormat } from "#modules/utils/dates";
import { LatestHistoryEntries } from "#modules/history";
import { backendUrl } from "#modules/requests";

type Data = EpisodeHistoryEntryEntity[];

type Props<ID> = {
  resourceId: ID;
  timestamp: EpisodeHistoryEntryEntity["date"]["timestamp"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type Criteria = EpisodeHistoryEntryRestDtos.GetManyByCriteria.Criteria;

export function LastestComponent(
  { resourceId: compKey, timestamp, dateFormat = DATE_FORMAT_DEFAULT }: Props<EpisodeCompKey>,
) {
  const URL = backendUrl(PATH_ROUTES.episodes.history.entries.search.path);
  const body: Criteria = {
    filter: {
      seriesKey: compKey.seriesKey,
      episodeKey: compKey.episodeKey,
      timestampMax: timestamp - 1,
    },
    sort: {
      timestamp: "desc",
    },
    limit: 10,
  };

  // TODO: cambiar 'any' cuando EpisodeHistoryEntry tenga 'resource' en vez de 'episode'
  return LatestHistoryEntries<any, Criteria>( {
    url: URL,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (res: DataResponse<Data>) => {
  assertIsManyDataResponse(res, episodeHistoryEntryEntitySchema as any);
};
