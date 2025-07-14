import z from "zod";
import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { musicHistoryEntrySchema } from "#musics/history/models/index";
import { MusicHistoryEntry } from "#modules/musics/history/models";
import { LatestHistoryEntries } from "#modules/history";
import { DateFormat } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { musicHistoryEntryRestDto } from "../../models/dto";

type Props = {
  resourceId: string;
  date: MusicHistoryEntry["date"];
  dateFormat?: DateFormat;
};
const DATE_FORMAT_DEFAULT: DateFormat = {
  dateTime: "datetime",
  ago: "yes",
};

type ReqBody = z.infer<typeof musicHistoryEntryRestDto.getManyEntriesByCriteria.reqBodySchema>;

export function LastestComponent(
  { resourceId, date, dateFormat = DATE_FORMAT_DEFAULT }: Props,
) {
  const url = backendUrl(PATH_ROUTES.musics.history.search.path);
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

const validator = (res: DataResponse<Required<MusicHistoryEntry>[]>) => {
  assertIsManyDataResponse(res, musicHistoryEntrySchema.required() as any);
};
