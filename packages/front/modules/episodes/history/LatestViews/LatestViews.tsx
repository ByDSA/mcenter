import { useCallback, useState } from "react";
import { EpisodeCompKey, EpisodeEntity } from "$shared/models/episodes";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";
import { EpisodeHistoryApi } from "../requests";
import { DateFormat } from "#modules/utils/dates";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { LatestViewsView } from "#modules/history/Latest/LatestViewsDisplay";
import { Separator } from "#modules/resources/Separator/Separator";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { FetchApi } from "#modules/fetching/fetch-api";

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
    const api = FetchApi.get(EpisodeHistoryApi);
    const result = await api.getLatestViews(
      episodeCompKey.seriesKey,
      episodeCompKey.episodeKey,
      maxTimestamp,
    );

    return result.data;
  }, [episodeCompKey, maxTimestamp]);
  const [data, setData] = useState<EpisodeHistoryEntryCrudDtos.GetMany.Response["data"]>();
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
    <DaInputGroup>
      <DaInputGroupItem inline>
        <DaLabel>Título</DaLabel>
        <span>{props.episode.title}</span>
      </DaInputGroupItem>
      <DaInputGroupItem inline>
        <DaLabel>Episodio</DaLabel>
        <span><span>{props.episode.serie?.name ?? data?.[0]?.resource.serie?.name
        ?? props.episode.compKey.seriesKey}</span><Separator /><span>{props.episode.compKey.episodeKey}</span></span>
      </DaInputGroupItem>
    </DaInputGroup>
    {element}
  </>;
}
