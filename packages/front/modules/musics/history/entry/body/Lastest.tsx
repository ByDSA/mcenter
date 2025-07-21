import { genAssertIsManyDataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { MusicHistoryEntryEntity, musicHistoryEntrySchema } from "#musics/history/models/index";
import { MusicHistoryEntry } from "#modules/musics/history/models";
import { LatestHistoryEntries } from "#modules/history";
import { DateFormat } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { MusicHistoryEntryRestDtos } from "../../models/dto";

type Props = {
  resourceId: string;
  date: MusicHistoryEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type Body = MusicHistoryEntryRestDtos.GetManyByCriteria.Criteria;

export function LastestComponent(
  { resourceId, date, dateFormat = DATE_FORMAT_DEFAULT }: Props,
) {
  const url = backendUrl(PATH_ROUTES.musics.history.search.path);
  const body: Body = {
    filter: {
      resourceId,
      timestampMax: date.timestamp - 1,
    },
    sort: {
      timestamp: "desc",
    },
    limit: 2,
    expand: [],
  };

  return LatestHistoryEntries<MusicHistoryEntryEntity, Body>( {
    url,
    body,
    validator: genAssertIsManyDataResponse(musicHistoryEntrySchema),
    dateFormat,
  } );
}
