import { MusicHistoryEntry } from "#modules/musics/history/models";
import { assertIsMusicVO } from "#modules/musics/models";
import { LatestHistoryEntries } from "#modules/history";
import { DateFormat } from "#modules/utils/dates";
import { MusicHistoryListGetManyEntriesBySearchRequest, assertIsMusicHistoryListGetManyEntriesBySearchResponse } from "#modules/musics/history/models/transport";
import { backendUrls } from "../../requests";

type Props = {
  resourceId: string;
  date: MusicHistoryEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type ReqBody = MusicHistoryListGetManyEntriesBySearchRequest["body"];

export function LastestComponent(
  { resourceId, date, dateFormat = DATE_FORMAT_DEFAULT }: Props,
) {
  const url = backendUrls.crud.search( {
    user: "user",
  } );
  const body: ReqBody = {
    filter: {
      resourceId,
      timestampMax: date.timestamp - 1,
    },
    sort: {
      timestamp: "desc",
    },
    limit: 2,
    expand: ["musics"],
  };

  return LatestHistoryEntries<MusicHistoryEntry, ReqBody>( {
    url,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (data: Required<MusicHistoryEntry>[]) => {
  assertIsMusicHistoryListGetManyEntriesBySearchResponse(data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};
