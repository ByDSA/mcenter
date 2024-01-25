import { LatestHistoryEntries } from "#modules/history";
import { DateFormat } from "#modules/utils/dates";
import { HistoryMusicEntry, HistoryMusicListGetManyEntriesBySearchRequest, assertIsHistoryMusicListGetManyEntriesBySearchResponse, assertIsMusicVO } from "#shared/models/musics";
import { backendUrls } from "../../requests";

type Props = {
  resourceId: string;
  date: HistoryMusicEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type ReqBody = HistoryMusicListGetManyEntriesBySearchRequest["body"];

export default function LastestComponent( {resourceId, date, dateFormat = DATE_FORMAT_DEFAULT}: Props) {
  const url = backendUrls.crud.search( {
    user: "user",
  } );
  const body: ReqBody = {
    "filter": {
      resourceId,
      timestampMax: date.timestamp - 1,
    },
    "sort": {
      "timestamp": "desc",
    },
    "limit": 2,
    "expand": ["musics"],
  };

  return LatestHistoryEntries<HistoryMusicEntry, ReqBody>( {
    url,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (data: Required<HistoryMusicEntry>[]) => {
  assertIsHistoryMusicListGetManyEntriesBySearchResponse(data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};