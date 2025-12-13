import { useCallback, useState } from "react";
import { MusicHistoryEntry, MusicHistoryEntryEntity, musicHistoryEntryEntitySchema } from "$shared/models/musics/history";
import { PATH_ROUTES } from "$shared/routing";
import { createManyResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genParseZod } from "$shared/utils/validation/zod";
import { MusicEntity } from "$shared/models/musics";
import { makeFetcher } from "#modules/fetching";
import { DateFormat } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { MusicHistoryEntryCrudDtos } from "#modules/musics/history/models/dto";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { LatestViewsView } from "../../../history/Latest/LatestViewsDisplay";

type Body = MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria;

const parseResponse = genParseZod(
  createManyResultResponseSchema(musicHistoryEntryEntitySchema),
) as (m: unknown)=> ResultResponse<MusicHistoryEntryEntity[]>;

type Props = {
  music?: MusicEntity;
  musicId: string;
  maxTimestamp?: number;
  dateFormat?: DateFormat;
  autoStart?: boolean;
};

export function MusicLatestViews(props: Props) {
  const [data, setData] = useState<MusicHistoryEntry[]>([]);
  const { musicId, maxTimestamp = new Date().getTime(), dateFormat } = props;
  const fetchData = useCallback(async () => {
    const url = backendUrl(PATH_ROUTES.musics.history.search.path);
    const body: Body = {
      filter: {
        resourceId: musicId,
        timestampMax: maxTimestamp - 1,
      },
      sort: {
        timestamp: "desc",
      },
      limit: 4,
      expand: [],
    };
    const fetcher = makeFetcher<Body, ResultResponse<MusicHistoryEntryEntity[]>>( {
      method: "POST",
      parseResponse,
    } );
    const result = await fetcher( {
      body,
      url,
    } );

    return result.data;
  }, [musicId, maxTimestamp]);
  const element = <AsyncLoader
    errorElement={<div>Error al cargar el historial</div>}
    action={fetchData}
    onSuccess={r=>setData(r)}
  ><LatestViewsView
      dates={data.map((d) => d.date.timestamp)}
      dateFormat={dateFormat}
    />
  </AsyncLoader>;

  if (!props.music)
    return element;

  return <>
    <p>
      <span>Título: {props.music?.title}</span><br />
      <span>Artista: {props.music?.artist}</span>
    </p>
    {element}
  </>;
}
