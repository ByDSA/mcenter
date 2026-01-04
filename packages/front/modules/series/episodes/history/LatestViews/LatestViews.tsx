import { useCallback, useState } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { createManyResultResponseSchema, ResultResponse } from "$shared/utils/http/responses";
import { genParseZod } from "$shared/utils/validation/zod";
import { EpisodeCompKey, EpisodeEntity } from "$shared/models/episodes";
import { makeFetcher } from "#modules/fetching";
import { DateFormat } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { LatestViewsView } from "#modules/history/Latest/LatestViewsDisplay";
import { Separator } from "#modules/resources/Separator";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";

type Data = EpisodeHistoryEntryEntity[];
type Criteria = EpisodeHistoryEntryCrudDtos.GetManyByCriteria.Criteria;

const parseResponse = genParseZod(
  createManyResultResponseSchema(episodeHistoryEntryEntitySchema),
) as (m: unknown)=> ResultResponse<Data>;

type Props = {
  episode?: EpisodeEntity;
  episodeCompKey: EpisodeCompKey;
  maxTimestamp?: number;
  dateFormat?: DateFormat;
  autoStart?: boolean;
};

export function EpisodeLatestViews(props: Props) {
  const { episodeCompKey, maxTimestamp = new Date().getTime(), dateFormat } = props;
  const fetchData = useCallback(async () => {
    const url = backendUrl(PATH_ROUTES.episodes.history.entries.search.path);
    const body: Criteria = {
      filter: {
        seriesKey: episodeCompKey.seriesKey,
        episodeKey: episodeCompKey.episodeKey,
        timestampMax: maxTimestamp - 1,
      },
      sort: {
        timestamp: "desc",
      },
      limit: 4,
      expand: ["episodes"],
    };
    const fetcher = makeFetcher<Criteria, ResultResponse<Data>>( {
      method: "POST",
      parseResponse,
    } );
    const result = await fetcher( {
      body,
      url,
    } );

    return result.data;
  }, [episodeCompKey, maxTimestamp]);
  const [data, setData] = useState<Data>();
  const element = <AsyncLoader
    errorElement={<div>Error al cargar el historial</div>}
    onSuccess={r=>setData(r)}
    action={fetchData}
  >
    {data && <LatestViewsView
      dates={data.map((d) => d.date.timestamp)}
      dateFormat={dateFormat}
    />}
  </AsyncLoader>;

  if (!props.episode)
    return element;

  return <>
    <p>
      <span>Título: {props.episode.title}</span><br />
      <span>Episodio: {props.episode.serie?.name
        ?? props.episode.compKey.seriesKey}</span><Separator /><span>{props.episode.compKey.episodeKey}</span>
    </p>
    {element}
  </>;
}
