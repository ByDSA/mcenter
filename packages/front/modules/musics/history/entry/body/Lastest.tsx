import z from "zod";
import { assertZod } from "#shared/utils/validation/zod";
import { Entry } from "#modules/musics/history/models";
import { assertIsMusicVO } from "#modules/musics/models";
import { LatestHistoryEntries } from "#modules/history";
import { DateFormat } from "#modules/utils/dates";
import { getManyEntriesBySearch } from "#modules/musics/history/models/dto";
import { backendUrls } from "../../requests";

type Props = {
  resourceId: string;
  date: Entry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type ReqBody = z.infer<typeof getManyEntriesBySearch.reqBodySchema>;

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

  return LatestHistoryEntries<Entry, ReqBody>( {
    url,
    body,
    validator,
    dateFormat,
  } );
}

const validator = (data: Required<Entry>[]) => {
  assertZod(getManyEntriesBySearch.resSchema, data);

  for (const d of data)
    assertIsMusicVO(d.resource);
};
